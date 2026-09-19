import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { NivelRiesgo } from '@prisma/client';

export class CreateInstitutionReportDto {
  @IsString()
  institucionId!: string;

  @IsInt()
  @Min(2010)
  anio!: number;

  @IsString()
  periodo!: string;

  @IsDateString()
  fechaCorte!: string;

  @IsInt()
  @Min(1)
  matriculaCorte!: number;

  @IsInt()
  @Min(0)
  desertoresConfirmados!: number;

  @IsIn(['BAJO', 'MEDIO', 'ALTO'])
  nivelRiesgoObservado!: NivelRiesgo;

  @IsOptional()
  @IsString()
  fuente?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  finalizado?: boolean;
}
