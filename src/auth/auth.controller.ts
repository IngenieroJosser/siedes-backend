import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UsePipes, 
  ValidationPipe, 
  HttpCode, 
  HttpStatus,
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto, RegisterStudentDto } from './dto/create-account.dto';
import { LoginUserDto } from './dto/sign-in.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { Rol, Etnia } from '@prisma/client';

@ApiTags('Autenticación y Registro de Usuarios')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Endpoint para registrar nuevos usuarios en el sistema. Los estudiantes requieren información adicional académica y contextual.'
  })
  @ApiBody({ 
    description: 'Datos de registro del usuario. Para estudiantes incluir información académica adicional.',
    type: RegisterUserDto,
    examples: {
      estudiante: {
        summary: 'Registro de Estudiante',
        value: {
          nombre: 'María',
          apellido: 'García',
          email: 'maria.garcia@ejemplo.com',
          identificacion: '987654321',
          telefono: '3007654321',
          password: 'password123',
          confirmPassword: 'password123',
          rol: Rol.ESTUDIANTE,
          edad: 16,
          genero: 'FEMENINO',
          etnia: Etnia.AFRODESCENDIENTE,
          grado: '10',
          institucionId: 'clkf8h3d90001',
          distanciaEscuela: 2.5,
          tiempoDesplazamiento: 30,
          trabaja: false,
          accesoInternet: true,
          dispositivoElectronico: true,
          apoyoFamiliar: true
        }
      },
      docente: {
        summary: 'Registro de Docente, Lider Comunitario o Coordinador',
        value: {
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          email: 'carlos.rodriguez@ejemplo.com',
          identificacion: '123456789',
          telefono: '3001234567',
          password: 'password123',
          confirmPassword: 'password123',
          rol: Rol.DOCENTE || Rol.LIDER_COMUNITARIO || Rol.COORDINADOR
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: 'clkf8h3d90001',
            nombre: 'María',
            apellido: 'García',
            email: 'maria.garcia@ejemplo.com',
            rol: 'ESTUDIANTE'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'El email debe ser un email válido'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El email o identificación ya existe',
    schema: {
      example: {
        success: false,
        message: 'El email ya está registrado',
        error: 'El email maria.garcia@ejemplo.com ya está en uso'
      }
    }
  })
  async register(@Body() registerDto: RegisterUserDto | RegisterStudentDto): Promise<AuthResponse> {
    // Validación adicional para estudiantes
    if (registerDto.rol === Rol.ESTUDIANTE) {
      const validation = await this.authService.validateStudentData(registerDto);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de estudiante inválidos',
          error: validation.errors.join(', '),
        };
      }
    }

    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Endpoint para autenticar usuarios en el sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      example: {
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: 'clkf8h3d90001',
            nombre: 'María',
            apellido: 'García',
            email: 'maria.garcia@ejemplo.com',
            rol: 'ESTUDIANTE',
            estudiante: {
              id: 'clkf8h3d90002',
              edad: 16,
              genero: 'FEMENINO',
              etnia: 'AFRODESCENDIENTE',
              grado: '10',
              riesgoDesercion: 0.3,
              institucion: {
                id: '1',
                nombre: 'Institución Educativa 1',
                ciudad: 'QUIBDO'
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Credenciales inválidas',
    schema: {
      example: {
        success: false,
        message: 'Credenciales inválidas',
        error: 'Email o contraseña incorrectos'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Cuenta desactivada',
    schema: {
      example: {
        success: false,
        message: 'Cuenta desactivada',
        error: 'La cuenta está desactivada. Contacte al administrador.'
      }
    }
  })
  async login(@Body() loginDto: LoginUserDto): Promise<AuthResponse> {
    return this.authService.loginUser(loginDto);
  }

  @Get('institutions')
  @ApiOperation({ 
    summary: 'Obtener lista de instituciones educativas',
    description: 'Endpoint para obtener todas las instituciones educativas disponibles para registro'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de instituciones obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'clkf8h3d90001',
            nombre: 'Institución Educativa 1',
            ciudad: 'QUIBDO',
            departamento: 'CHOCÓ',
            tipo: 'SECUNDARIA',
            direccion: 'Calle 123 # 45-67'
          },
          {
            id: 'clkf8h3d90002',
            nombre: 'Institución Educativa 2',
            ciudad: 'QUIBDO',
            departamento: 'CHOCÓ',
            tipo: 'MEDIA',
            direccion: 'Carrera 89 # 10-11'
          }
        ]
      }
    }
  })
  async getInstitutions() {
    const institutions = await this.authService.getInstitutions();
    return {
      success: true,
      data: institutions,
    };
  }

  @Get('check-email')
  @ApiOperation({ 
    summary: 'Verificar disponibilidad de email',
    description: 'Endpoint para verificar si un email está disponible para registro'
  })
  @ApiQuery({ 
    name: 'email', 
    required: true, 
    description: 'Email a verificar',
    example: 'usuario@ejemplo.com'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Disponibilidad del email verificada',
    schema: {
      example: {
        available: true
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email no proporcionado',
    schema: {
      example: {
        success: false,
        message: 'Email requerido',
        error: 'El parámetro email es requerido'
      }
    }
  })
  async checkEmailAvailability(@Query('email') email: string) {
    if (!email) {
      return {
        success: false,
        message: 'Email requerido',
        error: 'El parámetro email es requerido'
      };
    }
    return this.authService.checkEmailAvailability(email);
  }

  @Get('check-identification')
  @ApiOperation({ 
    summary: 'Verificar disponibilidad de identificación',
    description: 'Endpoint para verificar si un número de identificación está disponible para registro'
  })
  @ApiQuery({ 
    name: 'identificacion', 
    required: false, 
    description: 'Número de identificación a verificar',
    example: '123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Disponibilidad de la identificación verificada',
    schema: {
      example: {
        available: true
      }
    }
  })
  async checkIdentificationAvailability(@Query('identificacion') identificacion?: string) {
    if (!identificacion) {
      return {
        success: false,
        message: 'Identificación requerida',
        error: 'El parámetro identificacion es requerido'
      };
    }
    return this.authService.checkIdentificationAvailability(identificacion);
  }

  @Post('validate-student')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validar datos de estudiante',
    description: 'Endpoint para validar los datos específicos de estudiante antes del registro'
  })
  @ApiBody({ 
    type: RegisterStudentDto,
    description: 'Datos del estudiante a validar'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado de la validación',
    schema: {
      example: {
        success: true,
        message: 'Datos válidos',
        errors: []
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos',
    schema: {
      example: {
        success: false,
        message: 'Datos inválidos',
        errors: [
          'La edad debe estar entre 5 y 30 años',
          'La institución educativa no existe'
        ]
      }
    }
  })
  async validateStudentData(@Body() studentData: any) {
    const validation = await this.authService.validateStudentData(studentData);
    
    return {
      success: validation.isValid,
      message: validation.isValid ? 'Datos válidos' : 'Datos inválidos',
      errors: validation.errors,
    };
  }

  @Get('roles')
  @ApiOperation({ 
    summary: 'Obtener lista de roles disponibles',
    description: 'Endpoint para obtener todos los roles disponibles en el sistema con sus descripciones'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          { 
            value: 'ESTUDIANTE', 
            label: 'Estudiante', 
            description: 'Acceso a seguimiento académico, alertas tempranas y beneficios educativos' 
          },
          { 
            value: 'DOCENTE', 
            label: 'Docente', 
            description: 'Acceso al sistema de alertas tempranas y seguimiento de estudiantes' 
          },
          { 
            value: 'PADRE', 
            label: 'Padre/Madre de Familia', 
            description: 'Monitoreo del progreso académico y recepción de alertas sobre hijos' 
          },
          { 
            value: 'COORDINADOR', 
            label: 'Coordinador', 
            description: 'Acceso a reportes institucionales y gestión de alertas' 
          },
          { 
            value: 'LIDER_COMUNITARIO', 
            label: 'Líder Comunitario', 
            description: 'Participación en programas de prevención y apoyo estudiantil' 
          }
        ]
      }
    }
  })
  async getRoles() {
    const roles = [
      { 
        value: 'ESTUDIANTE', 
        label: 'Estudiante', 
        description: 'Acceso a seguimiento académico, alertas tempranas y beneficios educativos' 
      },
      { 
        value: 'DOCENTE', 
        label: 'Docente', 
        description: 'Acceso al sistema de alertas tempranas y seguimiento de estudiantes' 
      },
      { 
        value: 'PADRE', 
        label: 'Padre/Madre de Familia', 
        description: 'Monitoreo del progreso académico y recepción de alertas sobre hijos' 
      },
      { 
        value: 'COORDINADOR', 
        label: 'Coordinador', 
        description: 'Acceso a reportes institucionales y gestión de alertas' 
      },
      { 
        value: 'LIDER_COMUNITARIO', 
        label: 'Líder Comunitario', 
        description: 'Participación en programas de prevención y apoyo estudiantil' 
      }
    ];

    return {
      success: true,
      data: roles,
    };
  }

  @Get('etnias')
  @ApiOperation({ 
    summary: 'Obtener lista de etnias disponibles',
    description: 'Endpoint para obtener todas las etnias disponibles para registro de estudiantes'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de etnias obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          { value: 'NINGUNA', label: 'No me identifico' },
          { value: 'AFRODESCENDIENTE', label: 'Afrodescendiente' },
          { value: 'INDIGENA', label: 'Indígena' },
          { value: 'ROM', label: 'Pueblo Gitano (ROM)' },
          { value: 'RAIZAL', label: 'Raizal' },
          { value: 'PALENQUERO', label: 'Palenquero' }
        ]
      }
    }
  })
  async getEtnias() {
    const etnias = [
      { value: 'NINGUNA', label: 'No me identifico' },
      { value: 'AFRODESCENDIENTE', label: 'Afrodescendiente' },
      { value: 'INDIGENA', label: 'Indígena' },
      { value: 'ROM', label: 'Pueblo Gitano (ROM)' },
      { value: 'RAIZAL', label: 'Raizal' },
      { value: 'PALENQUERO', label: 'Palenquero' }
    ];

    return {
      success: true,
      data: etnias,
    };
  }

  @Get('grados')
  @ApiOperation({ 
    summary: 'Obtener lista de grados académicos',
    description: 'Endpoint para obtener los grados académicos disponibles para estudiantes'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grados obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          { value: '6', label: '6° Grado' },
          { value: '7', label: '7° Grado' },
          { value: '8', label: '8° Grado' },
          { value: '9', label: '9° Grado' },
          { value: '10', label: '10° Grado' },
          { value: '11', label: '11° Grado' },
          { value: 'UNIVERSIDAD', label: 'Universidad' }
        ]
      }
    }
  })
  async getGrados() {
    const grados = [
      { value: '6', label: '6° Grado' },
      { value: '7', label: '7° Grado' },
      { value: '8', label: '8° Grado' },
      { value: '9', label: '9° Grado' },
      { value: '10', label: '10° Grado' },
      { value: '11', label: '11° Grado' },
      { value: 'UNIVERSIDAD', label: 'Universidad' }
    ];

    return {
      success: true,
      data: grados,
    };
  }
}