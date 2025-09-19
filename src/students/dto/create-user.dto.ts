import { Dto } from 'src/lib/dto/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto extends Dto<CreateUserDto> {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Teléfono del usuario', example: '+573001234567', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}