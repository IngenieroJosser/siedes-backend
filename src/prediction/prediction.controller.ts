import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PredictionService } from './prediction.service';
import { StudentPredictionResultDto } from './dto/prediction-response.dto';

@ApiTags('Predicción de deserción')
@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get('health')
  @ApiOperation({ summary: 'Consultar disponibilidad del microservicio SIEDES AI' })
  getAiHealth() {
    return this.predictionService.getAiHealth();
  }

  @Post('students/:studentId')
  @ApiOperation({
    summary: 'Calcular riesgo de deserción de un estudiante',
    description:
      'Carga la información del estudiante desde PostgreSQL, consulta SIEDES AI y opcionalmente persiste la probabilidad en Estudiante.riesgoDesercion.',
  })
  @ApiParam({ name: 'studentId', type: String })
  @ApiQuery({
    name: 'persist',
    required: false,
    type: Boolean,
    description: 'Si es false, devuelve la inferencia sin actualizar riesgoDesercion.',
  })
  @ApiResponse({ status: 200, type: StudentPredictionResultDto })
  predictStudent(
    @Param('studentId') studentId: string,
    @Query('persist') persist?: string,
  ) {
    const shouldPersist = persist !== 'false';
    return this.predictionService.predictStudent(studentId, shouldPersist);
  }
}
