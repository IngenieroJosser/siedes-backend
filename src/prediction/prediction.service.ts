import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { StudentPredictionDto } from './dto/prediction-response.dto';

interface AiStudentPayload {
  student_id: string;
  school_code?: string;
  edad: number;
  grado: string;
  genero?: string;
  etnia?: string;
  academic?: {
    promedio?: number;
    inasistencias?: number;
    materias_aprobadas?: number;
    materias_reprobadas?: number;
    comportamiento?: number;
  };
  context?: {
    distancia_escuela?: number;
    tiempo_desplazamiento?: number;
    trabaja?: boolean;
    horas_trabajo?: number;
    ingresos_familiares?: number;
    personas_hogar?: number;
    apoyo_familiar?: boolean;
    acceso_internet?: boolean;
    dispositivo_electronico?: boolean;
    participacion_comunitaria?: boolean;
    conocimientos_ancestrales?: boolean;
    situaciones_especiales?: string;
    necesidades_especiales?: string;
  };
}

@Injectable()
export class PredictionService {
  private readonly aiBaseUrl = (process.env.AI_SERVICE_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
  private readonly timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? 7000);

  constructor(private readonly prisma: PrismaService) {}

  async getAiHealth() {
    try {
      return await this.requestJson(`${this.aiBaseUrl}/health/ready`, {
        method: 'GET',
      });
    } catch (error) {
      throw new ServiceUnavailableException(
        `SIEDES AI no está disponible: ${this.errorMessage(error)}`,
      );
    }
  }

  async predictStudent(studentId: string, persist = true) {
    const student = await this.prisma.estudiante.findUnique({
      where: { id: studentId },
      include: {
        institucion: {
          select: {
            id: true,
            nombre: true,
            codigoDANE: true,
          },
        },
        contexto: true,
        registros: {
          orderBy: { creadoEn: 'desc' },
          take: 1,
        },
      },
    });

    if (!student || !student.activo) {
      throw new NotFoundException('El estudiante no existe o está inactivo');
    }

    const latestAcademic = student.registros[0];
    const context = student.contexto;

    const payload: AiStudentPayload = {
      student_id: student.id,
      ...(student.institucion.codigoDANE
        ? { school_code: student.institucion.codigoDANE }
        : {}),
      edad: student.edad,
      grado: student.grado,
      genero: student.genero,
      etnia: student.etnia,
      ...(latestAcademic
        ? {
            academic: {
              promedio: latestAcademic.promedio,
              inasistencias: latestAcademic.inasistencias,
              materias_aprobadas: latestAcademic.materiasAprobadas,
              materias_reprobadas: latestAcademic.materiasReprobadas,
              ...(latestAcademic.comportamiento !== null
                ? { comportamiento: latestAcademic.comportamiento }
                : {}),
            },
          }
        : {}),
      ...(context
        ? {
            context: {
              distancia_escuela: context.distanciaEscuela,
              tiempo_desplazamiento: context.tiempoDesplazamiento,
              trabaja: context.trabaja,
              ...(context.horasTrabajo !== null
                ? { horas_trabajo: context.horasTrabajo }
                : {}),
              ...(context.ingresosFamiliares !== null
                ? { ingresos_familiares: context.ingresosFamiliares }
                : {}),
              personas_hogar: context.personasHogar,
              apoyo_familiar: context.apoyoFamiliar,
              acceso_internet: context.accesoInternet,
              dispositivo_electronico: context.dispositivoElectronico,
              participacion_comunitaria: context.participacionComunitaria,
              conocimientos_ancestrales: context.conocimientosAncestrales,
              ...(context.situacionesEspeciales
                ? { situaciones_especiales: context.situacionesEspeciales }
                : {}),
              ...(context.necesidadesEspeciales
                ? { necesidades_especiales: context.necesidadesEspeciales }
                : {}),
            },
          }
        : {}),
    };

    let prediction: StudentPredictionDto;
    try {
      prediction = await this.requestJson<StudentPredictionDto>(
        `${this.aiBaseUrl}/v1/predict/student`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
    } catch (error) {
      throw new ServiceUnavailableException(
        `No fue posible obtener la predicción de SIEDES AI: ${this.errorMessage(error)}`,
      );
    }

    if (
      typeof prediction.probability !== 'number' ||
      prediction.probability < 0 ||
      prediction.probability > 1
    ) {
      throw new ServiceUnavailableException(
        'SIEDES AI devolvió una probabilidad inválida',
      );
    }

    if (persist) {
      await this.prisma.estudiante.update({
        where: { id: student.id },
        data: { riesgoDesercion: prediction.probability },
      });
    }

    return {
      studentId: student.id,
      persisted: persist,
      prediction,
    };
  }

  private async requestJson<T = unknown>(
    url: string,
    init: RequestInit,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
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
