import { Dto } from 'src/lib/dto/dto';
import { IsEnum, IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NivelRiesgo } from '@prisma/client';
import { Type } from 'class-transformer';

export class FilterAlertsDto extends Dto<FilterAlertsDto> {
  @ApiProperty({
    description: 'Nivel de riesgo para filtrar',
    enum: NivelRiesgo,
    required: false,
  })
  @IsEnum(NivelRiesgo)
  @IsOptional()
  nivelRiesgo?: NivelRiesgo;

  @ApiProperty({
    description: 'Filtrar por alertas revisadas o no revisadas',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  revisada?: boolean;

  @ApiProperty({
    description: 'ID del estudiante para filtrar',
    required: false,
  })
  @IsString()
  @IsOptional()
  estudianteId?: string;

  @ApiProperty({
    description: 'Fecha de inicio para filtrar alertas',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha de fin para filtrar alertas',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiProperty({
    description: 'Término de búsqueda en descripción o factores',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}