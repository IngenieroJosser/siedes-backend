import { Injectable, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as argon2 from 'argon2';
import { RegisterUserDto, RegisterStudentDto } from './dto/create-account.dto';
import { LoginUserDto } from './dto/sign-in.dto';
import { AuthResponse, ValidationResult } from './dto/auth-response.dto';
import { Rol, Etnia } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    try {
      // Configuración recomendada para Argon2
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB
        timeCost: 3,
        parallelism: 1,
        hashLength: 32,
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new InternalServerErrorException('Error al procesar la contraseña');
    }
  }

  private async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  async registerUser(registerDto: RegisterUserDto | RegisterStudentDto): Promise<AuthResponse> {
    try {
      // Validar si el email ya existe
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Validar si la identificación ya existe (si se proporciona)
      if (registerDto.identificacion) {
        const existingByIdentification = await this.prisma.usuario.findUnique({
          where: { identificacion: registerDto.identificacion },
        });

        if (existingByIdentification) {
          throw new ConflictException('La identificación ya está registrada');
        }
      }

      // Hashear la contraseña con Argon2
      const hashedPassword = await this.hashPassword(registerDto.password);

      // Crear transacción para usuario y datos relacionados
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear usuario
        const user = await tx.usuario.create({
          data: {
            nombre: registerDto.nombre,
            apellido: registerDto.apellido,
            email: registerDto.email,
            identificacion: registerDto.identificacion,
            telefono: registerDto.telefono,
            password: hashedPassword,
            rol: registerDto.rol,
            activo: true,
          },
        });

        // Si es estudiante, crear registro en tabla Estudiante
        if (registerDto.rol === Rol.ESTUDIANTE) {
          const studentDto = registerDto as RegisterStudentDto;
          
          // Validar que la institución existe
          const institution = await tx.institucion.findUnique({
            where: { id: studentDto.institucionId },
          });

          if (!institution) {
            throw new BadRequestException('La institución educativa no existe');
          }

          // Validaciones específicas para estudiantes
          if (studentDto.edad < 5 || studentDto.edad > 30) {
            throw new BadRequestException('La edad debe estar entre 5 y 30 años');
          }

          if (!studentDto.genero) {
            throw new BadRequestException('El género es requerido');
          }

          if (!studentDto.grado) {
            throw new BadRequestException('El grado académico es requerido');
          }

          const student = await tx.estudiante.create({
            data: {
              usuarioId: user.id,
              edad: studentDto.edad,
              genero: studentDto.genero,
              etnia: studentDto.etnia || Etnia.NINGUNA,
              grado: studentDto.grado,
              institucionId: studentDto.institucionId,
              riesgoDesercion: 0.0,
              activo: true,
            },
          });

          // Crear contexto del estudiante si se proporcionan datos
          const hasContextData = 
            studentDto.distanciaEscuela !== undefined ||
            studentDto.tiempoDesplazamiento !== undefined ||
            studentDto.trabaja !== undefined;

          if (hasContextData) {
            await tx.contextoEstudiante.create({
              data: {
                estudianteId: student.id,
                distanciaEscuela: studentDto.distanciaEscuela || 0,
                tiempoDesplazamiento: studentDto.tiempoDesplazamiento || 0,
                trabaja: studentDto.trabaja || false,
                horasTrabajo: studentDto.horasTrabajo,
                ingresosFamiliares: studentDto.ingresosFamiliares,
                personasHogar: studentDto.personasHogar || 1,
                apoyoFamiliar: studentDto.apoyoFamiliar ?? true,
                accesoInternet: studentDto.accesoInternet ?? false,
                dispositivoElectronico: studentDto.dispositivoElectronico ?? false,
                participacionComunitaria: studentDto.participacionComunitaria ?? false,
                conocimientosAncestrales: studentDto.conocimientosAncestrales ?? false,
                situacionesEspeciales: studentDto.situacionesEspeciales,
                necesidadesEspeciales: studentDto.necesidadesEspeciales,
              },
            });
          }

          return { user, student };
        }

        return { user };
      });

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: result.user.id,
            nombre: result.user.nombre,
            apellido: result.user.apellido,
            email: result.user.email,
            rol: result.user.rol,
          },
        },
      };

    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Error en registro:', error);
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }

  async loginUser(loginDto: LoginUserDto): Promise<AuthResponse> {
    try {
      // Buscar usuario por email
      const user = await this.prisma.usuario.findUnique({
        where: { email: loginDto.email },
        include: {
          estudiante: {
            include: {
              institucion: {
                select: {
                  id: true,
                  nombre: true,
                  ciudad: true,
                },
              },
              contexto: true,
            },
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Credenciales inválidas');
      }

      if (!user.activo) {
        throw new BadRequestException('La cuenta está desactivada');
      }

      // Verificar contraseña con Argon2
      const isPasswordValid = await this.validatePassword(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Credenciales inválidas');
      }

      // Preparar respuesta del usuario
      const userResponse: any = {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        identificacion: user.identificacion,
        telefono: user.telefono,
        rol: user.rol,
        creadoEn: user.creadoEn,
      };

      // Incluir información de estudiante si existe
      if (user.estudiante) {
        userResponse.estudiante = {
          id: user.estudiante.id,
          edad: user.estudiante.edad,
          genero: user.estudiante.genero,
          etnia: user.estudiante.etnia,
          grado: user.estudiante.grado,
          riesgoDesercion: user.estudiante.riesgoDesercion,
          institucion: user.estudiante.institucion,
          contexto: user.estudiante.contexto,
        };
      }

      // Aquí podrías generar un token JWT si lo necesitas
      // const token = this.jwtService.sign({ 
      //   userId: user.id, 
      //   email: user.email, 
      //   rol: user.rol 
      // });

      return {
        success: true,
        message: 'Login exitoso',
        data: {
          user: userResponse,
          // token: token,
        },
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Error en login:', error);
      throw new InternalServerErrorException('Error al iniciar sesión');
    }
  }

  async validateStudentData(studentData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!studentData.edad || studentData.edad < 5 || studentData.edad > 30) {
      errors.push('La edad debe estar entre 5 y 30 años');
    }

    if (!studentData.genero) {
      errors.push('El género es requerido');
    }

    if (!studentData.grado) {
      errors.push('El grado académico es requerido');
    }

    if (!studentData.institucionId) {
      errors.push('La institución educativa es requerida');
    }

    // Validar que la institución existe
    if (studentData.institucionId) {
      const institution = await this.prisma.institucion.findUnique({
        where: { id: studentData.institucionId },
      });

      if (!institution) {
        errors.push('La institución educativa no existe');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getUserProfile(userId: string) {
    return this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        identificacion: true,
        telefono: true,
        rol: true,
        creadoEn: true,
        estudiante: {
          include: {
            institucion: {
              select: {
                id: true,
                nombre: true,
                ciudad: true,
                departamento: true,
                tipo: true,
              },
            },
            contexto: true,
          },
        },
      },
    });
  }

  async getInstitutions() {
    return this.prisma.institucion.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        nombre: true,
        ciudad: true,
        departamento: true,
        tipo: true,
        direccion: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email },
    });

    return {
      available: !existingUser,
    };
  }

  async checkIdentificationAvailability(identificacion: string): Promise<{ available: boolean }> {
    if (!identificacion) {
      return { available: true };
    }

    const existingUser = await this.prisma.usuario.findUnique({
      where: { identificacion },
    });

    return {
      available: !existingUser,
    };
  }
}