import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

export interface AiHealthResponse {
  status?: string;
  ready?: boolean;
  model_ready?: boolean;
  predictions_ready?: boolean;
  version?: string;
  [key: string]: unknown;
}

export interface AiDashboardSummary {
  anio: number;
  instituciones: number;
  riesgo: Record<'BAJO' | 'MEDIO' | 'ALTO', number>;
  prob_alto_media: number;
}

export interface AiInstitutionRisk {
  codigo_dane_establecimiento: string;
  institucion_educativa: string;
  zona_institucion?: string;
  anio: number;
  riesgo_predicho: 'BAJO' | 'MEDIO' | 'ALTO';
  prob_bajo?: number;
  prob_medio?: number;
  prob_alto?: number;
  [key: string]: unknown;
}

export interface AiInstitutionFactor {
  anio: number;
  codigo_dane_establecimiento: string;
  institucion_educativa: string;
  zona_institucion?: string;
  rank: number;
  feature: string;
  shap_alto: number;
  direccion: string;
  abs_shap: number;
}

@Injectable()
export class PredictionService {
  private readonly aiBaseUrl = (
    process.env.AI_SERVICE_URL ?? 'http://localhost:8000'
  ).replace(/\/+$/, '');
  private readonly timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? 10000);
  private readonly aiApiKey = process.env.AI_API_KEY ?? '';

  async getAiHealth(): Promise<AiHealthResponse> {
    try {
      const health = await this.requestJson<AiHealthResponse>(
        `${this.aiBaseUrl}/health`,
        { method: 'GET' },
        false,
      );

      let ready = false;
      try {
        await this.requestJson(`${this.aiBaseUrl}/ready`, { method: 'GET' }, false);
        ready = true;
      } catch {
        ready = false;
      }

      return { ...health, ready };
    } catch (error) {
      throw new ServiceUnavailableException(
        `SIEDES AI no está disponible: ${this.errorMessage(error)}`,
      );
    }
  }

  async getModelInfo() {
    return this.aiGet<Record<string, unknown>>('/model/info');
  }

  async getDashboardSummary(): Promise<AiDashboardSummary> {
    return this.aiGet<AiDashboardSummary>('/dashboard/summary');
  }

  async getInstitutions(): Promise<AiInstitutionRisk[]> {
    return this.aiGet<AiInstitutionRisk[]>('/institutions');
  }

  async getInstitutionHistory(schoolCode: string): Promise<AiInstitutionRisk[]> {
    return this.aiGet<AiInstitutionRisk[]>(
      `/institutions/${encodeURIComponent(schoolCode)}/history`,
    );
  }

  async getInstitutionFactors(
    schoolCode: string,
  ): Promise<AiInstitutionFactor[]> {
    return this.aiGet<AiInstitutionFactor[]>(
      `/institutions/${encodeURIComponent(schoolCode)}/factors`,
    );
  }

  private async aiGet<T>(path: string): Promise<T> {
    try {
      return await this.requestJson<T>(
        `${this.aiBaseUrl}${path}`,
        { method: 'GET' },
        true,
      );
    } catch (error) {
      throw new ServiceUnavailableException(
        `No fue posible consultar SIEDES AI (${path}): ${this.errorMessage(error)}`,
      );
    }
  }

  private async requestJson<T = unknown>(
    url: string,
    init: RequestInit,
    protectedRoute = true,
  ): Promise<T> {
    if (protectedRoute && !this.aiApiKey) {
      throw new Error(
        'AI_API_KEY no configurada en el backend. No se exponen secretos al navegador.',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers = new Headers(init.headers ?? {});
      headers.set('Accept', 'application/json');
      if (protectedRoute) {
        headers.set('X-API-Key', this.aiApiKey);
      }

      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      const text = await response.text();
      let body: unknown = null;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${
            typeof body === 'string' ? body : JSON.stringify(body)
          }`,
        );
      }

      return body as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return `timeout después de ${this.timeoutMs} ms`;
      }
      return error.message;
    }
    return 'error desconocido';
  }
}
