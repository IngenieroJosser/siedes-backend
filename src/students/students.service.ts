import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudent } from './dto/update-student.dto';
import { CreateContextoEstudianteDto } from './dto/create-contexto-estudiante.dto';
import * as bcrypt from 'bcrypt';
import { Rol } from '@prisma/client';
import { CreateCompleteStudentDto } from './dto/create-complete-student.dto';
import { PredictionService } from '../prediction/prediction.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly predictionService: PredictionService,
  ) {}

  async createStudent(dtoStudent: CreateStudentDto) {
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
        riesgoDesercion: dtoStudent.riesgoDesercion || 0.0,
      },
    });
  
    return createStudent;
  }

  async createCompleteStudent(createCompleteStudentDto: CreateCompleteStudentDto) {
    if (
      !createCompleteStudentDto.usuario ||
      !createCompleteStudentDto.estudiante ||
      !createCompleteStudentDto.contexto
    ) {
      throw new BadRequestException(
        'Datos incompletos. Se requieren usuario, estudiante y contexto.',
      );
    }

    const { usuario, estudiante, contexto } = createCompleteStudentDto;

    if (!usuario.email || !usuario.password || !usuario.nombre || !usuario.apellido) {
      throw new BadRequestException(
        'Faltan campos requeridos en la información del usuario',
      );
    }

    if (
      !estudiante.edad ||
      !estudiante.genero ||
      !estudiante.etnia ||
      !estudiante.grado ||
      !estudiante.institucionId
    ) {
      throw new BadRequestException(
        'Faltan campos requeridos en la información del estudiante',
      );
    }

    if (
      contexto.distanciaEscuela === undefined ||
      contexto.tiempoDesplazamiento === undefined ||
      contexto.personasHogar === undefined
    ) {
      throw new BadRequestException(
        'Faltan campos requeridos en el contexto del estudiante',
      );
    }

    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: usuario.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const validateInstitution = await this.prisma.institucion.findUnique({
      where: { id: estudiante.institucionId },
    });

    if (!validateInstitution) {
      throw new NotFoundException('La institución no existe');
    }

    const hashedPassword = await bcrypt.hash(usuario.password, 10);

    try {
      const transactionResult = await this.prisma.$transaction(async (prisma) => {
        const newUser = await prisma.usuario.create({
          data: {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            password: hashedPassword,
            rol: Rol.ESTUDIANTE,
          },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            rol: true,
            creadoEn: true,
          },
        });

        const newStudent = await prisma.estudiante.create({
          data: {
            usuarioId: newUser.id,
            institucionId: estudiante.institucionId,
            edad: estudiante.edad,
            genero: estudiante.genero,
            etnia: estudiante.etnia,
            grado: estudiante.grado,
            // El riesgo se calcula fuera de la transacción mediante SIEDES AI.
            riesgoDesercion: 0.0,
          },
          include: {
            institucion: {
              select: {
                id: true,
                nombre: true,
                ciudad: true,
                codigoDANE: true,
              },
            },
          },
        });

        const newContext = await prisma.contextoEstudiante.create({
          data: {
            estudianteId: newStudent.id,
            distanciaEscuela: contexto.distanciaEscuela,
            tiempoDesplazamiento: contexto.tiempoDesplazamiento,
            trabaja: contexto.trabaja,
            horasTrabajo: contexto.horasTrabajo,
            ingresosFamiliares: contexto.ingresosFamiliares,
            personasHogar: contexto.personasHogar,
            apoyoFamiliar: contexto.apoyoFamiliar,
            accesoInternet: contexto.accesoInternet,
            dispositivoElectronico: contexto.dispositivoElectronico,
            participacionComunitaria: contexto.participacionComunitaria,
            conocimientosAncestrales: contexto.conocimientosAncestrales,
            situacionesEspeciales: contexto.situacionesEspeciales,
            necesidadesEspeciales: contexto.necesidadesEspeciales,
          },
        });

        await prisma.registroAcademico.create({
          data: {
            estudianteId: newStudent.id,
            periodo: this.getCurrentPeriod(),
            promedio: 0,
            inasistencias: 0,
            materiasAprobadas: 0,
            materiasReprobadas: 0,
            comportamiento: 5,
            observaciones:
              'Registro académico inicial creado automáticamente',
          },
        });

        return {
          user: newUser,
          student: newStudent,
          contexto: newContext,
        };
      });

      let prediction: Awaited<
        ReturnType<PredictionService['predictStudent']>
      > | null = null;
      let predictionWarning: string | undefined;

      try {
        prediction = await this.predictionService.predictStudent(
          transactionResult.student.id,
          true,
        );
      } catch (predictionError) {
        console.warn(
          'Estudiante creado, pero SIEDES AI no pudo calcular el riesgo inicial:',
          predictionError,
        );
        predictionWarning =
          'El estudiante fue creado correctamente, pero la predicción inicial quedó pendiente.';
      }

      const currentStudent = await this.prisma.estudiante.findUnique({
        where: { id: transactionResult.student.id },
        include: {
          institucion: {
            select: {
              id: true,
              nombre: true,
              ciudad: true,
              codigoDANE: true,
            },
          },
        },
      });

      return {
        message: 'Estudiante creado exitosamente',
        data: {
          user: transactionResult.user,
          student: currentStudent ?? transactionResult.student,
          contexto: transactionResult.contexto,
          riesgoDesercion:
            prediction?.probability ??
            currentStudent?.riesgoDesercion ??
            0,
          prediction,
        },
        success: true,
        ...(predictionWarning ? { warning: predictionWarning } : {}),
      };
    } catch (error) {
      console.error(
        'Error en transacción de creación de estudiante:',
        error,
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno del servidor al crear el estudiante',
      );
    }
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const semester = now.getMonth() < 6 ? 'I' : 'II';
    return `${year}-${semester}`;
  }

  async updateStudent(id: string, dtoStudent: any) {
    const validateStudent = await this.prisma.estudiante.findUnique({
      where: { id },
      include: { usuario: true }
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
  
    // Actualizar el usuario si se proporciona
    if (dtoStudent.usuario) {
      await this.prisma.usuario.update({
        where: { id: validateStudent.usuarioId },
        data: dtoStudent.usuario
      });
    }
  
    // Actualizar estudiante
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
