import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

export type MlEventType =
  | 'STUDENT_CREATED'
  | 'STUDENT_UPDATED'
  | 'STUDENT_CONTEXT_UPDATED'
  | 'ALERT_CREATED'
  | 'ALERT_UPDATED'
  | 'INTERVENTION_CREATED'
  | 'INTERVENTION_UPDATED'
  | 'REPORT_CREATED'
  | 'REPORT_UPDATED'
  | 'REPORT_FINALIZED';

@Injectable()
export class MlEventService {
  private readonly logger = new Logger(MlEventService.name);

  constructor(private readonly prisma: PrismaService) {}

  private toJsonValue(value: unknown): Prisma.InputJsonValue {
    try {
      return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    } catch (error) {
      this.logger.error(
        'No fue posible serializar el payload del evento ML',
        error instanceof Error ? error.stack : String(error),
      );

      throw new Error('ML_EVENT_PAYLOAD_NOT_SERIALIZABLE');
    }
  }

  async enqueue(input: {
    eventType: MlEventType;
    aggregateType: string;
    aggregateId: string;
    institutionId?: string | null;
    payload?: Record<string, unknown>;
  }) {
    return this.prisma.mlOutboxEvent.create({
      data: {
        eventType: input.eventType,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        institutionId: input.institutionId ?? null,

        payload: this.toJsonValue(input.payload ?? {}),
      },
    });
  }
}