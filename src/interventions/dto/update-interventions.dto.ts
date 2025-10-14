import { PartialType } from '@nestjs/mapped-types';
import { CreateIntervencionDto } from './create-interventions.dto';
import { 
  IsString, 
  IsEnum, 
  IsArray, 
  IsDate, 
  IsOptional, 
  IsNumber, 
  Min, 
  Max 
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoIntervencion, EstadoIntervencion } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIntervencionDto extends PartialType(CreateIntervencionDto) {
  @ApiPropertyOptional({
    description: 'Tipo de intervención',
    enum: TipoIntervencion,
    example: TipoIntervencion.PSICOLOGICA
  })
  @IsOptional()
  @IsEnum(TipoIntervencion)
  tipo?: TipoIntervencion;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la intervención',
    example: 'Sesiones de apoyo emocional y manejo de ansiedad'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de la intervención',
    example: '2024-02-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaInicio?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de finalización de la intervención',
    example: '2024-12-20T00:00:00.000Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaFin?: Date;

  @ApiPropertyOptional({
    description: 'Estado actual de la intervención',
    enum: EstadoIntervencion,
    example: EstadoIntervencion.COMPLETADA
  })
  @IsOptional()
  @IsEnum(EstadoIntervencion)
  estado?: EstadoIntervencion;

  @ApiPropertyOptional({
    description: 'Efectividad de la intervención (valor entre 0 y 1)',
    minimum: 0,
    maximum: 1,
    example: 0.95
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  efectividad?: number;

  @ApiPropertyOptional({
    description: 'Lista de recursos utilizados en la intervención',
    example: ['Beca alimentaria', 'Subsidio de transporte'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recursosUtilizados?: string[];

  @ApiPropertyOptional({
    description: 'Lista de participantes involucrados en la intervención',
    example: ['Coordinador de bienestar', 'Trabajadora social'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantes?: string[];

  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre la intervención',
    example: 'Intervención exitosa, estudiante ha mejorado su asistencia'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}