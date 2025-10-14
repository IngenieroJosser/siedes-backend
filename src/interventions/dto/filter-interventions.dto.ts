import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoIntervencion, EstadoIntervencion } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterIntervencionesDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de intervención',
    enum: TipoIntervencion,
    example: TipoIntervencion.ACADEMICA
  })
  @IsOptional()
  @IsEnum(TipoIntervencion)
  tipo?: TipoIntervencion;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la intervención',
    enum: EstadoIntervencion,
    example: EstadoIntervencion.ACTIVA
  })
  @IsOptional()
  @IsEnum(EstadoIntervencion)
  estado?: EstadoIntervencion;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del estudiante',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsString()
  estudianteId?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por texto en descripción u observaciones',
    example: 'tutoría matemáticas'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar intervenciones',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaInicio?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtrar intervenciones',
    example: '2024-12-31T00:00:00.000Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaFin?: Date;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de la institución',
    example: '660e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsString()
  institucionId?: string;
}