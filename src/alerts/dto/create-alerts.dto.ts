import { Dto } from 'src/lib/dto/dto';
import { IsString, IsEnum, IsArray, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NivelRiesgo } from '@prisma/client';

export class CreateAlertaDesercionDto extends Dto<CreateAlertaDesercionDto> {
  @ApiProperty({
    description: 'ID del estudiante',
    example: 'clz9k3t2h0000abc123xyz789',
  })
  @IsString()
  estudianteId: string;

  @ApiProperty({
    description: 'Nivel de riesgo de la alerta',
    enum: NivelRiesgo,
    example: NivelRiesgo.ALTO,
  })
  @IsEnum(NivelRiesgo)
  nivelRiesgo: NivelRiesgo;

  @ApiProperty({
    description: 'Descripción de la alerta',
    example: 'El estudiante muestra signos de deserción debido a inasistencias frecuentes.',
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    description: 'Factores de riesgo identificados',
    example: ['Inasistencias frecuentes', 'Bajo rendimiento académico'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  factores: string[];

  @ApiProperty({
    description: 'Indica si la alerta ha sido revisada',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  revisada?: boolean;

  @ApiProperty({
    description: 'Fecha de revisión de la alerta',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaRevision?: string;
}