import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@ApiTags('Gestión de Instituciones')
@ApiBearerAuth()
@Controller('institution')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo Institución',description: 'Crea un nuevo registro de Institución en el sistema SIEDES' })
  @ApiResponse({ status: 201, description: 'Institución creado exitosamente',})
  @ApiResponse({ status: 404, description: 'Institución no encontrada' })
  @ApiResponse({ status: 409, description: 'La institución y aestá creada' })
  createInstitution(@Body() dataInstitution: CreateInstitutionDto) {
    return this.institutionService.createInstitution(dataInstitution);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos las instituciones activos',description: 'Retorna una lista de todos las instituciones activos en el sistema' })
  @ApiResponse({ status: 200, description: 'Lista de instituciones obtenida exitosamente', })
  getAllInstitution() {
    return this.institutionService.getAllInstitution();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una institución por ID',description: 'Retorna la información detallada de la institución específica' })
  @ApiResponse({ status: 200, description: 'Institución encontrada exitosamente',})
  @ApiResponse({ status: 404, description: 'Institución no encontrada' })
  @ApiParam({name: 'id',description: 'ID del Institución',type: String,})
  getInstitutionById(@Param('id') id: string) {
    return this.institutionService.getInstitutionById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una institución',description: 'Actualiza la información de un estudiante existente'})
  @ApiResponse({ status: 200, description: 'Institución actualizada correctamente', })
  @ApiResponse({ status: 404, description: 'Institución no encontrada' })
  @ApiParam({name: 'id',description: 'ID del Institución a actualizar',type: String, })
  updateInstitution(@Param('id') id: string, @Body() updateInstitution: UpdateInstitutionDto) {
    return this.institutionService.updateInstitution(id, updateInstitution);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una institución (soft delete)',description: 'Desactiva una institución en el sistema mediante soft delete'})
  @ApiResponse({ status: 200, description: 'Institución desactivada correctamente', })
  @ApiResponse({ status: 404, description: 'Institución no encontrada' })
  @ApiParam({name: 'id',description: 'ID de la institución a desactivar',type: String, })
  deleteInstitution(@Param('id') id: string) {
    return this.institutionService.removeInstitution(id);
  }
}
