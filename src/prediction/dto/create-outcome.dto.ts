import { ApiProperty } from '@nestjs/swagger';
import { EstadoPermanencia } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOutcomeDto {
  @ApiProperty({ description: 'ID interno del estudiante' })
  @IsString()
  @IsNotEmpty()
  estudianteId: string;

  @ApiProperty({ example: '2026-I', description: 'Periodo en el que se observaron las features' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  periodoObservacion: string;

  @ApiProperty({ example: '2026-II', description: 'Periodo en el que se observa el resultado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  periodoResultado: string;

  @ApiProperty({ enum: EstadoPermanencia })
  @IsEnum(EstadoPermanencia)
  estadoResultado: EstadoPermanencia;
}
