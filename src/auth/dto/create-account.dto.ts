import { Dto } from 'src/lib/dto/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber, IsBoolean } from 'class-validator';
import { Rol, Etnia } from '@prisma/client';

export class RegisterUserDto extends Dto<RegisterUserDto> {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    required: true
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: true
  })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  apellido: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@ejemplo.com',
    required: true
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El formato del email es inválido' })
  email: string;

  @ApiPropertyOptional({
    description: 'Número de identificación',
    example: '123456789',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'La identificación debe ser una cadena de texto' })
  identificacion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '3001234567',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
    required: true
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Confirmación de contraseña',
    example: 'password123',
    minLength: 6,
    required: true
  })
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  @MinLength(6, { message: 'La confirmación debe tener al menos 6 caracteres' })
  confirmPassword: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: Rol,
    example: Rol.ESTUDIANTE,
    required: true
  })
  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(Rol, { message: 'El rol debe ser uno de los valores permitidos' })
  rol: Rol;
}

export class RegisterStudentDto extends RegisterUserDto {
  @ApiProperty({
    description: 'Edad del estudiante',
    example: 16,
    minimum: 5,
    maximum: 30,
    required: true
  })
  @IsNotEmpty({ message: 'La edad es requerida' })
  @IsNumber({}, { message: 'La edad debe ser un número' })
  edad: number;

  @ApiProperty({
    description: 'Género del estudiante',
    example: 'MASCULINO',
    required: true
  })
  @IsNotEmpty({ message: 'El género es requerido' })
  @IsString({ message: 'El género debe ser una cadena de texto' })
  genero: string;

  @ApiPropertyOptional({
    description: 'Etnia del estudiante',
    enum: Etnia,
    example: Etnia.AFRODESCENDIENTE,
    required: false
  })
  @IsOptional()
  @IsEnum(Etnia, { message: 'La etnia debe ser uno de los valores permitidos' })
  etnia?: Etnia;

  @ApiProperty({
    description: 'Grado académico del estudiante',
    example: '10',
    required: true
  })
  @IsNotEmpty({ message: 'El grado académico es requerido' })
  @IsString({ message: 'El grado académico debe ser una cadena de texto' })
  grado: string;

  @ApiProperty({
    description: 'ID de la institución educativa',
    example: 'clkf8h3d90001',
    required: true
  })
  @IsNotEmpty({ message: 'La institución educativa es requerida' })
  @IsString({ message: 'El ID de la institución debe ser una cadena de texto' })
  institucionId: string;

  // Campos de contexto (opcionales)
  @ApiPropertyOptional({
    description: 'Distancia a la escuela en kilómetros',
    example: 2.5,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'La distancia debe ser un número' })
  distanciaEscuela?: number;

  @ApiPropertyOptional({
    description: 'Tiempo de desplazamiento en minutos',
    example: 30,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'El tiempo de desplazamiento debe ser un número' })
  tiempoDesplazamiento?: number;

  @ApiPropertyOptional({
    description: '¿El estudiante trabaja actualmente?',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo trabaja debe ser un valor booleano' })
  trabaja?: boolean;

  @ApiPropertyOptional({
    description: 'Horas de trabajo semanales',
    example: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Las horas de trabajo deben ser un número' })
  horasTrabajo?: number;

  @ApiPropertyOptional({
    description: 'Ingresos familiares mensuales',
    example: 1500000,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los ingresos familiares deben ser un número' })
  ingresosFamiliares?: number;

  @ApiPropertyOptional({
    description: 'Número de personas en el hogar',
    example: 4,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'El número de personas debe ser un número' })
  personasHogar?: number;

  @ApiPropertyOptional({
    description: '¿El estudiante tiene apoyo familiar?',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo apoyo familiar debe ser un valor booleano' })
  apoyoFamiliar?: boolean;

  @ApiPropertyOptional({
    description: '¿El estudiante tiene acceso a internet?',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo acceso a internet debe ser un valor booleano' })
  accesoInternet?: boolean;

  @ApiPropertyOptional({
    description: '¿El estudiante tiene dispositivo electrónico?',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo dispositivo electrónico debe ser un valor booleano' })
  dispositivoElectronico?: boolean;

  @ApiPropertyOptional({
    description: '¿El estudiante participa en actividades comunitarias?',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo participación comunitaria debe ser un valor booleano' })
  participacionComunitaria?: boolean;

  @ApiPropertyOptional({
    description: '¿El estudiante tiene conocimientos ancestrales?',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo conocimientos ancestrales debe ser un valor booleano' })
  conocimientosAncestrales?: boolean;

  @ApiPropertyOptional({
    description: 'Situaciones especiales del estudiante',
    example: 'Ninguna situación especial reportada',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Las situaciones especiales deben ser una cadena de texto' })
  situacionesEspeciales?: string;

  @ApiPropertyOptional({
    description: 'Necesidades especiales del estudiante',
    example: 'Ninguna necesidad especial reportada',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Las necesidades especiales deben ser una cadena de texto' })
  necesidadesEspeciales?: string;
}