import { Body, Controller, Get, Headers, HttpException, Post, UnauthorizedException } from '@nestjs/common';
import { MlTrainingExportService } from './ml-training-export.service';
import { MlOutboxWorker } from './ml-outbox.worker';

@Controller()
export class MlController {
  constructor(
    private readonly exportService: MlTrainingExportService,
    private readonly worker: MlOutboxWorker,
  ) {}

  private assertBackendInternalKey(key?: string) {
    const expected = process.env.BACKEND_INTERNAL_API_KEY;
    if (!expected || !key || key !== expected) {
      throw new UnauthorizedException('Internal API key inválida');
    }
  }

  private async callAi(path: string, method: 'GET' | 'POST' = 'GET', body?: unknown) {
    const aiUrl = (process.env.AI_SERVICE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
    const key = process.env.AI_INTERNAL_API_KEY;
    if (!key) throw new HttpException('AI_INTERNAL_API_KEY no configurada', 503);
    const response = await fetch(`${aiUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Internal-API-Key': key },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    let payload: unknown = text;
    try { payload = text ? JSON.parse(text) : {}; } catch {}
    if (!response.ok) throw new HttpException(payload as string | object, response.status);
    return payload;
  }

  @Get('/internal/ml/training-snapshot')
  async trainingSnapshot(@Headers('x-internal-api-key') key?: string) {
    this.assertBackendInternalKey(key);
    return this.exportService.buildSnapshot();
  }

  @Get('/ml/retraining/status')
  retrainingStatus() {
    return this.callAi('/internal/v1/retraining/status');
  }

  @Post('/ml/retraining/evaluate')
  evaluateRetraining(@Body() body: { force?: boolean } = {}) {
    return this.callAi('/internal/v1/retraining/evaluate', 'POST', body);
  }

  @Post('/ml/outbox/flush')
  async flushOutbox() {
    await this.worker.flush();
    return { ok: true };
  }
}
