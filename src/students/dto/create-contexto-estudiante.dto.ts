import { Dto } from 'src/lib/dto/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContextoEstudianteDto extends Dto<CreateContextoEstudianteDto> {
  @ApiProperty({ description: 'Distancia a la escuela en km', example: 2.5 })
  @IsNumber()
  distanciaEscuela: number;

  @ApiProperty({ description: 'Tiempo de desplazamiento en minutos', example: 45 })
  @IsNumber()
  tiempoDesplazamiento: number;

  @ApiProperty({ description: 'Indica si el estudiante trabaja', example: false })
  @IsBoolean()
  trabaja: boolean;

  @ApiProperty({ description: 'Horas de trabajo semanales', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  horasTrabajo?: number;

  @ApiProperty({ description: 'Ingresos familiares mensuales', example: 850000, required: false })
  @IsNumber()
  @IsOptional()
  ingresosFamiliares?: number;

  @ApiProperty({ description: 'Número de personas en el hogar', example: 4 })
  @IsNumber()
  personasHogar: number;

  @ApiProperty({ description: 'Indica si tiene apoyo familiar', example: true })
  @IsBoolean()
  apoyoFamiliar: boolean;

  @ApiProperty({ description: 'Indica si tiene acceso a internet', example: false })
  @IsBoolean()
  accesoInternet: boolean;

  @ApiProperty({ description: 'Indica si tiene dispositivo electrónico', example: false })
  @IsBoolean()
  dispositivoElectronico: boolean;

  @ApiProperty({ description: 'Indica si participa en actividades comunitarias', example: false })
  @IsBoolean()
  participacionComunitaria: boolean;

  @ApiProperty({ description: 'Indica si maneja conocimientos ancestrales', example: true })
  @IsBoolean()
  conocimientosAncestrales: boolean;

  @ApiProperty({ description: 'Situaciones especiales de vulnerabilidad', required: false })
  @IsString()
  @IsOptional()
  situacionesEspeciales?: string;

  @ApiProperty({ description: 'Necesidades educativas especiales', required: false })
  @IsString()
  @IsOptional()
  necesidadesEspeciales?: string;
}