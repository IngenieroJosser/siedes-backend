import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PredictionService } from './prediction.service';

@ApiTags('Riesgo institucional SIEDES AI')
@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Consultar disponibilidad del microservicio SIEDES AI',
  })
  getAiHealth() {
    return this.predictionService.getAiHealth();
  }

  @Get('model')
  @ApiOperation({
    summary: 'Consultar metadata del modelo institucional desplegado',
  })
  getModelInfo() {
    return this.predictionService.getModelInfo();
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Resumen del riesgo de deserción por institución educativa',
  })
  getDashboardSummary() {
    return this.predictionService.getDashboardSummary();
  }

  @Get('institutions')
  @ApiOperation({
    summary: 'Listar riesgo predictivo del último corte por institución',
    description:
      'Devuelve exclusivamente resultados institucionales. SIEDES no expone predicción individual como producto del piloto.',
  })
  getInstitutions() {
    return this.predictionService.getInstitutions();
  }

  @Get('institutions/:schoolCode/history')
  @ApiOperation({
    summary: 'Consultar histórico de riesgo de una institución educativa',
  })
  @ApiParam({ name: 'schoolCode', description: 'Código DANE del establecimiento' })
  @ApiResponse({ status: 200, description: 'Serie histórica institucional' })
  getInstitutionHistory(@Param('schoolCode') schoolCode: string) {
    return this.predictionService.getInstitutionHistory(schoolCode);
  }

  @Get('institutions/:schoolCode/factors')
  @ApiOperation({
    summary: 'Consultar factores SHAP asociados al riesgo institucional',
  })
  @ApiParam({ name: 'schoolCode', description: 'Código DANE del establecimiento' })
  getInstitutionFactors(@Param('schoolCode') schoolCode: string) {
    return this.predictionService.getInstitutionFactors(schoolCode);
  }
}
