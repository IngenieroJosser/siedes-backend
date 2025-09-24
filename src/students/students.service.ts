import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudent } from './dto/update-student.dto';
import { CreateContextoEstudianteDto } from './dto/create-contexto-estudiante.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Rol, Etnia } from '@prisma/client';
import { CreateCompleteStudentDto } from './dto/create-complete-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly usuarioService: UserService,
  ) {}

  async createStudent(dtoStudent: CreateStudentDto) {
    const validateUser = await this.prisma.usuario.findUnique({
      where: { id: dtoStudent.usuarioId },
    });
  
    if (!validateUser) {
      throw new NotFoundException('El usuario no existe');
    }

    // Verificar si el usuario ya tiene un estudiante asociado
    const existingStudent = await this.prisma.estudiante.findFirst({
      where: { 
        usuarioId: dtoStudent.usuarioId,
        activo: true 
      },
    });

    if (existingStudent) {
      throw new ConflictException('Este usuario ya tiene un estudiante asociado');
    }

    // Verificar si la institución existe
    const validateInstitution = await this.prisma.institucion.findUnique({
      where: { id: dtoStudent.institucionId },
    });

    if (!validateInstitution) {
      throw new NotFoundException('La institución no existe');
    }
  
    const createStudent = await this.prisma.estudiante.create({
      data: {
        usuarioId: dtoStudent.usuarioId,
        institucionId: dtoStudent.institucionId,
        edad: dtoStudent.edad,
        genero: dtoStudent.genero,
        etnia: dtoStudent.etnia,
        grado: dtoStudent.grado,
        riesgoDesercion: dtoStudent.riesgoDesercion,
      },
    });
  
    return createStudent;
  }

  async createCompleteStudent(createCompleteStudentDto: CreateCompleteStudentDto) {
    const { usuario, estudiante, contexto } = createCompleteStudentDto;
  
    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: usuario.email },
    });
  
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }
  
    // Verificar si la institución existe
    const validateInstitution = await this.prisma.institucion.findUnique({
      where: { id: estudiante.institucionId },
    });
  
    if (!validateInstitution) {
      throw new NotFoundException('La institución no existe');
    }
  
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
  
    return this.prisma.$transaction(async (prisma) => {
      // Crear usuario
      const newUser = await prisma.usuario.create({
        data: {
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          telefono: usuario.telefono,
          password: hashedPassword,
          rol: Rol.ESTUDIANTE,
        },
      });
  
      // Crear estudiante
      const newStudent = await prisma.estudiante.create({
        data: {
          usuarioId: newUser.id,
          institucionId: estudiante.institucionId,
          edad: estudiante.edad,
          genero: estudiante.genero,
          etnia: estudiante.etnia,
          grado: estudiante.grado,
          riesgoDesercion: 0.0, // Valor inicial, se actualizará después
        },
      });
  
      // Crear contexto del estudiante
      await prisma.contextoEstudiante.create({
        data: {
          estudianteId: newStudent.id,
          distanciaEscuela: contexto.distanciaEscuela,
          tiempoDesplazamiento: contexto.tiempoDesplazamiento,
          trabaja: contexto.trabaja,
          horasTrabajo: contexto.horasTrabajo || 0,
          ingresosFamiliares: contexto.ingresosFamiliares || 0,
          personasHogar: contexto.personasHogar,
          apoyoFamiliar: contexto.apoyoFamiliar,
          accesoInternet: contexto.accesoInternet,
          dispositivoElectronico: contexto.dispositivoElectronico,
          participacionComunitaria: contexto.participacionComunitaria,
          conocimientosAncestrales: contexto.conocimientosAncestrales,
          situacionesEspeciales: contexto.situacionesEspeciales || '',
          necesidadesEspeciales: contexto.necesidadesEspeciales || '',
        },
      });
  
      // Calcular riesgo de deserción inicial
      const riesgoDesercion = await this.calcularRiesgoDesercionInicial({
        distanciaEscuela: contexto.distanciaEscuela,
        tiempoDesplazamiento: contexto.tiempoDesplazamiento,
        trabaja: contexto.trabaja,
        horasTrabajo: contexto.horasTrabajo || 0,
        ingresosFamiliares: contexto.ingresosFamiliares || 0,
        personasHogar: contexto.personasHogar,
        apoyoFamiliar: contexto.apoyoFamiliar,
        accesoInternet: contexto.accesoInternet,
        dispositivoElectronico: contexto.dispositivoElectronico,
      });
  
      // Actualizar estudiante con el riesgo de deserción calculado
      await prisma.estudiante.update({
        where: { id: newStudent.id },
        data: { riesgoDesercion },
      });
  
      return {
        user: newUser,
        student: newStudent,
        riesgoDesercion,
      };
    });
  }

  private async calcularRiesgoDesercionInicial(contexto: any): Promise<number> {
    let riesgo = 0.0;
    
    // Factores que aumentan el riesgo
    if (contexto.distanciaEscuela > 5) riesgo += 0.1;
    if (contexto.tiempoDesplazamiento > 60) riesgo += 0.1;
    if (contexto.trabaja) riesgo += 0.2;
    if (contexto.horasTrabajo > 20) riesgo += 0.1;
    if (contexto.ingresosFamiliares < 500000) riesgo += 0.15;
    if (contexto.personasHogar > 5) riesgo += 0.05;
    if (!contexto.apoyoFamiliar) riesgo += 0.15;
    if (!contexto.accesoInternet) riesgo += 0.1;
    if (!contexto.dispositivoElectronico) riesgo += 0.1;
    
    // Limitar a un máximo de 1.0
    return Math.min(riesgo, 1.0);
  }

  async updateStudent(id: string, dtoStudent: UpdateStudent) {
    const validateStudent = await this.prisma.estudiante.findUnique({
      where: { id },
    });
  
    if (!validateStudent) {
      throw new NotFoundException('El estudiante no existe');
    }

    // Si se está actualizando la institución, verificar que exista
    if (dtoStudent.institucionId) {
      const validateInstitution = await this.prisma.institucion.findUnique({
        where: { id: dtoStudent.institucionId },
      });
    
      if (!validateInstitution) {
        throw new NotFoundException('La institución no existe');
      }
    }
  
    const updateStudent = await this.prisma.estudiante.update({
      where: { id },
      data: {
        edad: dtoStudent.edad,
        genero: dtoStudent.genero,
        etnia: dtoStudent.etnia,
        grado: dtoStudent.grado,
        riesgoDesercion: dtoStudent.riesgoDesercion,
        institucionId: dtoStudent.institucionId,
      },
    });
  
    return updateStudent;
  }

  async updateStudentContext(estudianteId: string, contextoData: CreateContextoEstudianteDto) {
    const validateStudent = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });
  
    if (!validateStudent) {
      throw new NotFoundException('El estudiante no existe');
    }

    // Verificar si ya existe un contexto para este estudiante
    const existingContext = await this.prisma.contextoEstudiante.findUnique({
      where: { estudianteId },
    });

    if (existingContext) {
      // Actualizar contexto existente
      return this.prisma.contextoEstudiante.update({
        where: { estudianteId },
        data: contextoData,
      });
    } else {
      // Crear nuevo contexto
      return this.prisma.contextoEstudiante.create({
        data: {
          estudianteId,
          ...contextoData,
        },
      });
    }
  }

  async findAllStudents() {
    return this.prisma.estudiante.findMany({
      where: { activo: true },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            rol: true,
          },
        },
        institucion: {
          select: {
            id: true,
            nombre: true,
          },
        },
        contexto: true,
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });
  } 
  
  async findStudentById(id: string) {
    const foundStudent = await this.prisma.estudiante.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            rol: true,
          },
        },
        institucion: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
          },
        },
        contexto: true,
        registros: {
          orderBy: {
            creadoEn: 'desc',
          },
          take: 10,
        },
        alertas: {
          where: {
            revisada: false,
          },
          orderBy: {
            creadaEn: 'desc',
          },
          take: 5,
        },
      },
    });
  
    if (!foundStudent) {
      throw new NotFoundException('El estudiante no existe');
    }
  
    return foundStudent;
  }

  async removeStudent(id: string) {
    const validateStudent = await this.prisma.estudiante.findUnique({
      where: { id },
    });
  
    if (!validateStudent) {
      throw new NotFoundException('El estudiante no existe');
    }

    return this.prisma.estudiante.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findStudentsByInstitution(institucionId: string) {
    const validateInstitution = await this.prisma.institucion.findUnique({
      where: { id: institucionId },
    });
  
    if (!validateInstitution) {
      throw new NotFoundException('La institución no existe');
    }

    return this.prisma.estudiante.findMany({
      where: { 
        institucionId,
        activo: true 
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        contexto: true,
      },
      orderBy: {
        usuario: {
          nombre: 'asc',
        },
      },
    });
  }

  async getStudentStats() {
    const total = await this.prisma.estudiante.count({
      where: { activo: true },
    });
    
    const byInstitution = await this.prisma.estudiante.groupBy({
      by: ['institucionId'],
      where: { activo: true },
      _count: {
        id: true,
      },
    });
    
    const highRisk = await this.prisma.estudiante.count({
      where: { 
        activo: true,
        riesgoDesercion: {
          gt: 0.7,
        },
      },
    });
    
    return {
      total,
      byInstitution,
      highRisk,
      mediumRisk: await this.prisma.estudiante.count({
        where: { 
          activo: true,
          riesgoDesercion: {
            gt: 0.4,
            lte: 0.7,
          },
        },
      }),
      lowRisk: await this.prisma.estudiante.count({
        where: { 
          activo: true,
          riesgoDesercion: {
            lte: 0.4,
          },
        },
      }),
    };
  }
}