import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertaDesercionDto } from './create-alerts.dto';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class PartialAlertaDesercionDto extends PartialType(CreateAlertaDesercionDto) {}

export class UpdateAlertaDesercionDto extends PartialAlertaDesercionDto {
  @ApiProperty({
    description: 'Indica si la alerta ha sido revisada',
    example: true,
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
