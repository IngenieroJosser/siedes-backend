import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PredictionFactorDto {
  @ApiProperty()
  factor: string;

  @ApiProperty()
  contribution: number;

  @ApiProperty({ enum: ['AUMENTA', 'REDUCE', 'CONTEXTUAL'] })
  direction: 'AUMENTA' | 'REDUCE' | 'CONTEXTUAL';

  @ApiProperty()
  explanation: string;
}

export class StudentPredictionDto {
  @ApiProperty({ minimum: 0, maximum: 1 })
  probability: number;

  @ApiProperty({ enum: ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'] })
  risk_level: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

  @ApiProperty({ enum: ['student_supervised', 'hybrid_baseline'] })
  model_type: 'student_supervised' | 'hybrid_baseline';

  @ApiProperty()
  model_version: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 1, nullable: true })
  institutional_prior?: number | null;

  @ApiProperty({ type: [PredictionFactorDto] })
  factors: PredictionFactorDto[];

  @ApiProperty({ type: [String] })
  warnings: string[];
}

export class StudentPredictionResultDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  persisted: boolean;

  @ApiProperty({ type: StudentPredictionDto })
  prediction: StudentPredictionDto;
}
