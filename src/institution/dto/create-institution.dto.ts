import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TipoInstitucion, Departamento, CiudadesUIUB } from '@prisma/client';
import { Dto } from 'src/lib/dto/dto';

export class CreateInstitutionDto extends Dto<CreateInstitutionDto> {
  @ApiProperty({ description: 'Nombre oficial de la institución educativa', example: 'Institución Educativa Integrado Carrasquilla Industrial' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Dirección física de la institución', example: 'Calle 25 # 7-45, Barrio El Jardín, Quibdó' })
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({ description: 'Ciudad o municipio de la institución', example: 'QUIBDO', enum: CiudadesUIUB })
  @IsEnum(CiudadesUIUB)
  @IsNotEmpty()
  ciudad: CiudadesUIUB;

  @ApiProperty({ description: 'Departamento al que pertenece la institución', example: 'CHOCÓ', enum: Departamento })
  @IsEnum(Departamento)
  @IsNotEmpty()
  departamento: Departamento;

  @ApiProperty({ description: 'Tipo de institución educativa', example: 'UNIVERSIDAD', enum: TipoInstitucion })
  @IsEnum(TipoInstitucion)
  @IsNotEmpty()
  tipo: TipoInstitucion;

  @ApiProperty({ description: 'Código DANE asignado por el Ministerio de Educación', example: '227001000456', required: false })
  @IsString()
  @IsOptional()
  codigoDANE?: string;
}
