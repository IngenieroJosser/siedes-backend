import { Body, Controller, Get, Param, Patch, Post, Delete, Query } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentsService } from './students.service';
import { UpdateStudent } from './dto/update-student.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Gestión Estudiantil')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo estudiante',description: 'Crea un nuevo registro de estudiante en el sistema SIEDES' })
  @ApiResponse({ status: 201, description: 'Estudiante creado exitosamente',})
  @ApiResponse({ status: 404, description: 'Usuario o institución no encontrada' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene un estudiante asociado' })
  createStudent(@Body() dtoStudent: CreateStudentDto) {
    return this.studentService.createStudent(dtoStudent);
  }
  
  @Get()
  @ApiOperation({ summary: 'Obtener todos los estudiantes activos',description: 'Retorna una lista de todos los estudiantes activos en el sistema' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes obtenida exitosamente', })
  @ApiQuery({name: 'institucionId',required: false,description: 'Filtrar estudiantes por institución',type: String, })
  getAllStudents(@Query('institucionId') institucionId?: string) {
    if (institucionId) {
      return this.studentService.findStudentsByInstitution(institucionId);
    }
    return this.studentService.findAllStudents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estudiante por ID',description: 'Retorna la información detallada de un estudiante específico' })
  @ApiResponse({ status: 200, description: 'Estudiante encontrado exitosamente',})
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiParam({name: 'id',description: 'ID del estudiante',type: String,})
  getStudentById(@Param('id') id: string) {
    return this.studentService.findStudentById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un estudiante',description: 'Actualiza la información de un estudiante existente'})
  @ApiResponse({ status: 200, description: 'Estudiante actualizado correctamente', })
  @ApiResponse({ status: 404, description: 'Estudiante o institución no encontrada' })
  @ApiParam({name: 'id',description: 'ID del estudiante a actualizar',type: String, })
  updateStudent(@Param('id') id: string, @Body() updateStudent: UpdateStudent) {
    return this.studentService.updateStudent(id, updateStudent);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un estudiante (soft delete)',description: 'Desactiva un estudiante en el sistema mediante soft delete'})
  @ApiResponse({ status: 200, description: 'Estudiante desactivado correctamente', })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiParam({name: 'id',description: 'ID del estudiante a desactivar',type: String, })
  deleteStudent(@Param('id') id: string) {
    return this.studentService.removeStudent(id);
  }
}