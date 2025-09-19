import { Dto } from 'src/lib/dto/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from '@prisma/client';

export class CreateUserDto extends Dto<CreateUserDto>{
  @ApiProperty({ description: 'Nombres del usuario', example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Apellidos del usuario', example: 'Pérez' })
  @IsNotEmpty()
  @IsString()
  apellido: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Teléfono', example: '+573001234567', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ description: 'Contraseña', example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: Rol })
  @IsEnum(Rol)
  rol: Rol;
}