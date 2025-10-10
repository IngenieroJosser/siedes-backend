import { 
Controller, 
Get, 
Post, 
Body, 
Patch, 
Param, 
Delete, 
ParseUUIDPipe,
Query,
HttpStatus,
HttpCode,
Put
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertaDesercionDto } from './dto/create-alerts.dto';
import { UpdateAlertaDesercionDto } from './dto/update-alerts.dto';
import { FilterAlertsDto } from './dto/filter-alerts.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

ApiTags('Gestión de alertas ')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva alerta de deserción' })
  @ApiResponse({ status: 201, description: 'Alerta creada correctamente.' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(@Body() createAlertDto: CreateAlertaDesercionDto) {
    return this.alertsService.createAlert(createAlertDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las alertas con filtros opcionales' })
  @ApiQuery({ name: 'nivelRiesgo', required: false, enum: ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'] })
  @ApiQuery({ name: 'revisada', required: false, type: Boolean })
  @ApiQuery({ name: 'estudianteId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() filterAlertsDto?: FilterAlertsDto) {
    return this.alertsService.findAllAlerts(filterAlertsDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de alertas' })
  getStats() {
    return this.alertsService.getAlertsStats();
  }

  @Get('critical')
  @ApiOperation({ summary: 'Obtener alertas críticas no revisadas' })
  getCriticalAlerts() {
    return this.alertsService.getCriticalAlerts();
  }

  @Get('student/:estudianteId')
  @ApiOperation({ summary: 'Obtener alertas por estudiante' })
  @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  getAlertsByStudent(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
    return this.alertsService.getAlertsByStudent(estudianteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una alerta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la alerta' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una alerta' })
  @ApiParam({ name: 'id', description: 'ID de la alerta' })
  @ApiResponse({ status: 200, description: 'Alerta actualizada correctamente.' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAlertDto: UpdateAlertaDesercionDto) {
    return this.alertsService.updateAlert(id, updateAlertDto);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Marcar una alerta como revisada' })
  @ApiParam({ name: 'id', description: 'ID de la alerta' })
  @ApiResponse({ status: 200, description: 'Alerta marcada como revisada.' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada.' })
  markAsReviewed(@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.markAsReviewed(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una alerta' })
  @ApiParam({ name: 'id', description: 'ID de la alerta' })
  @ApiResponse({ status: 204, description: 'Alerta eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.removeAlert(id);
  }
}
