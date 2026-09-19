import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class MlOutboxWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MlOutboxWorker.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const pollMs = Number(process.env.ML_OUTBOX_POLL_MS ?? 5000);
    this.timer = setInterval(() => void this.flush(), Math.max(1000, pollMs));
    this.timer.unref?.();
    void this.flush();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async flush() {
    if (this.running) return;
    this.running = true;
    try {
      const aiUrl = (process.env.AI_SERVICE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
      const internalKey = process.env.AI_INTERNAL_API_KEY;
      if (!internalKey) {
        this.logger.warn('AI_INTERNAL_API_KEY no configurada; eventos ML permanecerán en outbox.');
        return;
      }

      const events = await this.prisma.mlOutboxEvent.findMany({
        where: {
          status: { in: ['PENDING', 'RETRY'] },
          nextAttemptAt: { lte: new Date() },
          attempts: { lt: 10 },
        },
        orderBy: { createdAt: 'asc' },
        take: 25,
      });

      for (const event of events) {
        try {
          const response = await fetch(`${aiUrl}/internal/v1/training/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-API-Key': internalKey,
            },
            body: JSON.stringify({
              eventId: event.id,
              eventType: event.eventType,
              aggregateType: event.aggregateType,
              aggregateId: event.aggregateId,
              institutionId: event.institutionId,
              occurredAt: event.createdAt.toISOString(),
              payload: event.payload,
            }),
          });
          if (!response.ok) {
            const text = await response.text();
            throw new Error(`AI HTTP ${response.status}: ${text.slice(0, 500)}`);
          }
          await this.prisma.mlOutboxEvent.update({
            where: { id: event.id },
            data: { status: 'PROCESSED', processedAt: new Date(), lastError: null },
          });
        } catch (error) {
          const attempts = event.attempts + 1;
          const backoffSeconds = Math.min(900, Math.pow(2, attempts) * 5);
          await this.prisma.mlOutboxEvent.update({
            where: { id: event.id },
            data: {
              status: attempts >= 10 ? 'FAILED' : 'RETRY',
              attempts,
              lastError: error instanceof Error ? error.message : String(error),
              nextAttemptAt: new Date(Date.now() + backoffSeconds * 1000),
            },
          });
          this.logger.error(`No fue posible entregar evento ML ${event.id}: ${error}`);
        }
      }
    } finally {
      this.running = false;
    }
  }
}
