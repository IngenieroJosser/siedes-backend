import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOutcomeDto } from './dto/create-outcome.dto';
import { PredictionService } from './prediction.service';

@ApiTags('IA y Predicción')
@ApiBearerAuth()
@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  private assertInternalKey(value?: string) {
    const expected = process.env.PREDICTION_INTERNAL_KEY;
    if (!expected) {
      throw new ServiceUnavailableException(
        'PREDICTION_INTERNAL_KEY no está configurada',
      );
    }
    if (value !== expected) {
      throw new ForbiddenException('Credencial interna inválida');
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar disponibilidad del servicio SIEDES AI' })
  health() {
    return this.predictionService.health();
  }

  @Get('model')
  @ApiOperation({ summary: 'Consultar metadata del modelo cargado en SIEDES AI' })
  model() {
    return this.predictionService.modelMetadata();
  }

  @Post('students/:studentId')
  @ApiOperation({
    summary: 'Calcular riesgo de un estudiante con SIEDES AI',
    description:
      'Construye las features desde PostgreSQL, invoca FastAPI y opcionalmente persiste la predicción y actualiza riesgoDesercion.',
  })
  @ApiParam({ name: 'studentId', type: String })
  @ApiQuery({
    name: 'persist',
    required: false,
    type: Boolean,
    description: 'Por defecto true. Use false para inferencia sin persistencia.',
  })
  predictStudent(
    @Param('studentId') studentId: string,
    @Query('persist') persist?: string,
  ) {
    return this.predictionService.predictStudent(
      studentId,
      persist !== 'false',
    );
  }

  @Get('students/:studentId/history')
  @ApiOperation({ summary: 'Historial de predicciones persistidas del estudiante' })
  history(@Param('studentId') studentId: string) {
    return this.predictionService.predictionHistory(studentId);
  }

  @Post('outcomes')
  @ApiHeader({ name: 'X-Internal-Key', required: true })
  @ApiOperation({
    summary: 'Registrar outcome longitudinal real para aprendizaje supervisado',
  })
  recordOutcome(
    @Body() dto: CreateOutcomeDto,
    @Headers('x-internal-key') internalKey?: string,
  ) {
    this.assertInternalKey(internalKey);
    return this.predictionService.recordOutcome(dto);
  }

  @Get('training-data')
  @ApiHeader({ name: 'X-Internal-Key', required: true })
  @ApiOperation({
    summary: 'Exportar snapshot anonimizado y etiquetado para reentrenamiento',
    description:
      'No devuelve nombres, correos ni teléfonos. Solo observaciones con outcome real y registro académico del periodo de observación.',
  })
  trainingData(@Headers('x-internal-key') internalKey?: string) {
    this.assertInternalKey(internalKey);
    return this.predictionService.trainingData();
  }
}
