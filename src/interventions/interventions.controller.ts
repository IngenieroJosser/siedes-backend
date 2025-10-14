import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { CreateIntervencionDto } from './dto/create-interventions.dto';
import { UpdateIntervencionDto } from './dto/update-interventions.dto';
import { FilterIntervencionesDto } from './dto/filter-interventions.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Gestión de Intervenciones')
@Controller('interventions')
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva intervención' })
  @ApiResponse({ status: 201, description: 'Intervención creada correctamente.' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(@Body() createIntervencionDto: CreateIntervencionDto) {
    return this.interventionsService.create(createIntervencionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las intervenciones con filtros opcionales' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['ACADEMICA', 'PSICOLOGICA', 'ECONOMICA', 'FAMILIAR', 'COMUNITARIA', 'CULTURAL', 'TUTORIA', 'OTRA'] })
  @ApiQuery({ name: 'estado', required: false, enum: ['ACTIVA', 'COMPLETADA', 'SUSPENDIDA', 'CANCELADA'] })
  @ApiQuery({ name: 'estudianteId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'institucionId', required: false, type: String })
  findAll(@Query() filterIntervencionesDto?: FilterIntervencionesDto) {
    return this.interventionsService.findAll(filterIntervencionesDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de intervenciones' })
  getStats() {
    return this.interventionsService.getIntervencionesStats();
  }

  @Get('student/:estudianteId')
  @ApiOperation({ summary: 'Obtener intervenciones por estudiante' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  getIntervencionesByStudent(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
    return this.interventionsService.getIntervencionesByStudent(estudianteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una intervención por ID' })
  @ApiParam({ name: 'id', description: 'ID de la intervención' })
  @ApiResponse({ status: 404, description: 'Intervención no encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.interventionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una intervención' })
  @ApiParam({ name: 'id', description: 'ID de la intervención' })
  @ApiResponse({ status: 200, description: 'Intervención actualizada correctamente.' })
  @ApiResponse({ status: 404, description: 'Intervención no encontrada.' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateIntervencionDto: UpdateIntervencionDto
  ) {
    return this.interventionsService.update(id, updateIntervencionDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marcar una intervención como completada' })
  @ApiParam({ name: 'id', description: 'ID de la intervención' })
  @ApiResponse({ status: 200, description: 'Intervención marcada como completada.' })
  @ApiResponse({ status: 404, description: 'Intervención no encontrada.' })
  markAsCompleted(@Param('id', ParseUUIDPipe) id: string) {
    return this.interventionsService.markAsCompleted(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una intervención' })
  @ApiParam({ name: 'id', description: 'ID de la intervención' })
  @ApiResponse({ status: 204, description: 'Intervención eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Intervención no encontrada.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.interventionsService.remove(id);
  }
}
