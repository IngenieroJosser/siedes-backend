import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { CreateStudentDto } from './create-student.dto';
import { CreateContextoEstudianteDto } from './create-contexto-estudiante.dto';

export class CreateCompleteStudentDto {
  @ApiProperty({ type: CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  usuario: CreateUserDto;

  @ApiProperty({ type: CreateStudentDto })
  @ValidateNested()
  @Type(() => CreateStudentDto)
  estudiante: CreateStudentDto;

  @ApiProperty({ type: CreateContextoEstudianteDto })
  @ValidateNested()
  @Type(() => CreateContextoEstudianteDto)
  contexto: CreateContextoEstudianteDto;
}