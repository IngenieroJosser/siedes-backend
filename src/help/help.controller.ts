import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HelpService } from './help.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { AskForHelp } from './dto/ask-for-help.dto';
import { CreateInstitutionDto } from 'src/institution/dto/create-institution.dto';
import { CreateStudentDto } from 'src/students/dto/create-student.dto';

@ApiTags('Solicitud de ayuda rápida')
@Controller('help')
export class HelpController {
  constructor(private helpService: HelpService) {}

  @Post('create-quick-help-request')
  @ApiOperation({ summary: 'Crear una solicitud de ayuda rápida', description: 'Crea una nueva solicitud de ayuda rápida para un estudiante en riesgo de deserción escolar' })
  @ApiResponse({  status: 201,  description: 'Solicitud creada exitosamente', type: AskForHelp })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description:  'Institución o estudiante no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto - Ya existe una solicitud similar' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  createQuickHelpRequest(@Body() dtoQuickHelpRequest: AskForHelp) {
    return this.helpService.quickHelpRequest(dtoQuickHelpRequest);
  }

  @Get('institutions')
  @ApiOperation({ summary: 'Obtener lista de instituciones', description: 'Retorna la lista completa de instituciones educativas disponibles para solicitar ayuda' })
  @ApiResponse({ status: 200,  description: 'Lista de instituciones obtenida exitosamente', type: [CreateInstitutionDto] })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getInstitutions() {
    return this.helpService.getInstitutions();
  }

  @Get('quickHelpRequest')
  @ApiOperation({ summary: 'Obtener todas las solicitudes rápdias del usuario', description: 'Retorna todas la solicitudes rápidas que hace un usuario' })
  @ApiResponse({ status: 200,  description: 'Lista de solicitudes rápidas obtenidas exitosamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getquickHelpRequest() {
    return this.helpService.getAllquickHelpRequest();
  }

  @Get('students')
  @ApiOperation({ summary: 'Obtener lista de estudiantes', description: 'Retorna la lista completa de estudiantes registrados en el sistema' })
  @ApiResponse({ status: 200,  description: 'Lista de estudiantes obtenida exitosamente', type: [CreateStudentDto] })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getStudents() {
    return this.helpService.getStudents();
  }

  @Get('students/by-institution/:institutionId')
  @ApiOperation({ summary: 'Obtener estudiantes por institución', description: 'Retorna la lista de estudiantes filtrados por institución educativa' })
  @ApiParam({ name: 'institutionId', type: String, description: 'ID de la institución educativa', example: 'cmfxihkqr0000uh7gx9zv9yg3' })
  @ApiResponse({ status: 200,  description: 'Lista de estudiantes por institución obtenida exitosamente', type: [CreateStudentDto] })
  @ApiResponse({ status: 404, description: 'Institución no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getStudentsByInstitution(@Param('institutionId') institutionId: string) {
    return this.helpService.getStudentsByInstitution(institutionId);
  }
}