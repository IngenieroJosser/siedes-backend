import { Dto } from "src/lib/dto/dto";
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntervencionDto extends Dto<CreateIntervencionDto>{
  @ApiProperty({
    description: 'ID del estudiante al que se le asigna la intervención',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsString()
  estudianteId: string;

  @ApiProperty({
    description: 'Tipo de intervención',
    enum: TipoIntervencion,
    example: TipoIntervencion.ACADEMICA
  })
  @IsEnum(TipoIntervencion)
  tipo: TipoIntervencion;

  @ApiProperty({
    description: 'Descripción detallada de la intervención',
    example: 'Tutorías personalizadas en matemáticas y ciencias para mejorar el rendimiento académico'
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    description: 'Fecha de inicio de la intervención',
    example: '2024-01-15T00:00:00.000Z'
  })
  @IsDate()
  @Type(() => Date)
  fechaInicio: Date;

  @ApiPropertyOptional({
    description: 'Fecha de finalización de la intervención (opcional)',
    example: '2024-06-15T00:00:00.000Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaFin?: Date;

  @ApiPropertyOptional({
    description: 'Estado actual de la intervención',
    enum: EstadoIntervencion,
    example: EstadoIntervencion.ACTIVA
  })
  @IsOptional()
  @IsEnum(EstadoIntervencion)
  estado?: EstadoIntervencion;

  @ApiPropertyOptional({
    description: 'Efectividad de la intervención (valor entre 0 y 1)',
    minimum: 0,
    maximum: 1,
    example: 0.85
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  efectividad?: number;

  @ApiProperty({
    description: 'Lista de recursos utilizados en la intervención',
    example: ['Material didáctico', 'Plataforma virtual', 'Tutor especializado'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  recursosUtilizados: string[];

  @ApiProperty({
    description: 'Lista de participantes involucrados en la intervención',
    example: ['Docente de matemáticas', 'Psicóloga educativa', 'Familia'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  participantes: string[];

  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre la intervención',
    example: 'El estudiante ha mostrado mejora significativa en su rendimiento'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}