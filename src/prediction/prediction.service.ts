import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EstadoPermanencia, NivelRiesgo, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOutcomeDto } from './dto/create-outcome.dto';

type AiRiskFactor = {
  factor: string;
  contribution: number;
  direction: 'AUMENTA' | 'REDUCE' | 'CONTEXTUAL';
  explanation: string;
};

export type AiStudentPrediction = {
  probability: number;
  risk_level: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  model_type: 'student_supervised' | 'hybrid_baseline';
  model_version: string;
  institutional_prior?: number | null;
  factors: AiRiskFactor[];
  warnings: string[];
};

type AiStudentRequest = {
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
};

@Injectable()
export class PredictionService {
  private readonly aiBaseUrl =
    process.env.AI_SERVICE_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

  private readonly timeoutMs = Number(process.env.AI_TIMEOUT_MS || 7000);

  constructor(private readonly prisma: PrismaService) {}

  private async aiRequest<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.aiBaseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new BadGatewayException(
          `SIEDES AI respondió ${response.status}: ${body.slice(0, 500)}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new ServiceUnavailableException(
        'El servicio SIEDES AI no está disponible temporalmente',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async health() {
    return this.aiRequest<Record<string, unknown>>('/health/ready', {
      method: 'GET',
    });
  }

  async modelMetadata() {
    return this.aiRequest<Record<string, unknown>>('/v1/model/metadata', {
      method: 'GET',
    });
  }

  private async buildStudentPayload(
    estudianteId: string,
  ): Promise<AiStudentRequest> {
    const student = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: {
        contexto: true,
        institucion: {
          select: {
            id: true,
            nombre: true,
            codigoDANE: true,
          },
        },
        registros: {
          orderBy: { creadoEn: 'desc' },
          take: 1,
        },
      },
    });

    if (!student || !student.activo) {
      throw new NotFoundException('El estudiante no existe o está inactivo');
    }

    const academic = student.registros[0];
    const context = student.contexto;

    return {
      student_id: student.id,
      school_code: student.institucion.codigoDANE || undefined,
      edad: student.edad,
      grado: student.grado,
      genero: student.genero,
      etnia: student.etnia,
      academic: academic
        ? {
            promedio: academic.promedio,
            inasistencias: academic.inasistencias,
            materias_aprobadas: academic.materiasAprobadas,
            materias_reprobadas: academic.materiasReprobadas,
            comportamiento: academic.comportamiento ?? undefined,
          }
        : undefined,
      context: context
        ? {
            distancia_escuela: context.distanciaEscuela,
            tiempo_desplazamiento: context.tiempoDesplazamiento,
            trabaja: context.trabaja,
            horas_trabajo: context.horasTrabajo ?? undefined,
            ingresos_familiares: context.ingresosFamiliares ?? undefined,
            personas_hogar: context.personasHogar,
            apoyo_familiar: context.apoyoFamiliar,
            acceso_internet: context.accesoInternet,
            dispositivo_electronico: context.dispositivoElectronico,
            participacion_comunitaria: context.participacionComunitaria,
            conocimientos_ancestrales: context.conocimientosAncestrales,
            situaciones_especiales: context.situacionesEspeciales ?? undefined,
            necesidades_especiales: context.necesidadesEspeciales ?? undefined,
          }
        : undefined,
    };
  }

  async predictStudent(estudianteId: string, persist = true) {
    const payload = await this.buildStudentPayload(estudianteId);
    const prediction = await this.aiRequest<AiStudentPrediction>(
      '/v1/predict/student',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    if (!persist) {
      return {
        ...prediction,
        persisted: false,
      };
    }

    await this.prisma.$transaction([
      this.prisma.estudiante.update({
        where: { id: estudianteId },
        data: { riesgoDesercion: prediction.probability },
      }),
      this.prisma.prediccionRiesgo.create({
        data: {
          estudianteId,
          probability: prediction.probability,
          nivelRiesgo: prediction.risk_level as NivelRiesgo,
          modelType: prediction.model_type,
          modelVersion: prediction.model_version,
          institutionalPrior: prediction.institutional_prior ?? null,
          factores: prediction.factors as Prisma.InputJsonValue,
          warnings: prediction.warnings as Prisma.InputJsonValue,
        },
      }),
    ]);

    return {
      ...prediction,
      persisted: true,
    };
  }

  async predictionHistory(estudianteId: string) {
    const exists = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('El estudiante no existe');
    }

    return this.prisma.prediccionRiesgo.findMany({
      where: { estudianteId },
      orderBy: { creadaEn: 'desc' },
      take: 100,
    });
  }

  async recordOutcome(dto: CreateOutcomeDto) {
    const student = await this.prisma.estudiante.findUnique({
      where: { id: dto.estudianteId },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException('El estudiante no existe');
    }

    return this.prisma.outcomeEstudiantePeriodo.upsert({
      where: {
        estudianteId_periodoObservacion_periodoResultado: {
          estudianteId: dto.estudianteId,
          periodoObservacion: dto.periodoObservacion,
          periodoResultado: dto.periodoResultado,
        },
      },
      create: {
        estudianteId: dto.estudianteId,
        periodoObservacion: dto.periodoObservacion,
        periodoResultado: dto.periodoResultado,
        estadoResultado: dto.estadoResultado,
        desertoSiguientePeriodo:
          dto.estadoResultado === EstadoPermanencia.DESERTO,
      },
      update: {
        estadoResultado: dto.estadoResultado,
        desertoSiguientePeriodo:
          dto.estadoResultado === EstadoPermanencia.DESERTO,
      },
    });
  }

  async trainingData() {
    const outcomes = await this.prisma.outcomeEstudiantePeriodo.findMany({
      orderBy: { registradoEn: 'asc' },
      include: {
        estudiante: {
          include: {
            contexto: true,
            institucion: {
              select: {
                codigoDANE: true,
              },
            },
            registros: {
              orderBy: { creadoEn: 'asc' },
            },
          },
        },
      },
    });

    return outcomes.flatMap((outcome) => {
      const student = outcome.estudiante;
      const academic = student.registros.find(
        (record) => record.periodo === outcome.periodoObservacion,
      );

      // No se fabrica una feature académica si no existe la observación del periodo t.
      if (!academic) return [];

      const context = student.contexto;

      return [
        {
          student_id: student.id,
          school_code: student.institucion.codigoDANE,
          periodo_observacion: outcome.periodoObservacion,
          periodo_resultado: outcome.periodoResultado,
          edad: student.edad,
          grado: student.grado,
          genero: student.genero,
          etnia: student.etnia,
          promedio: academic.promedio,
          inasistencias: academic.inasistencias,
          materias_aprobadas: academic.materiasAprobadas,
          materias_reprobadas: academic.materiasReprobadas,
          comportamiento: academic.comportamiento,
          distancia_escuela: context?.distanciaEscuela ?? 0,
          tiempo_desplazamiento: context?.tiempoDesplazamiento ?? 0,
          trabaja: context?.trabaja ?? false,
          horas_trabajo: context?.horasTrabajo ?? 0,
          ingresos_familiares: context?.ingresosFamiliares ?? 0,
          personas_hogar: context?.personasHogar ?? 0,
          apoyo_familiar: context?.apoyoFamiliar ?? false,
          acceso_internet: context?.accesoInternet ?? false,
          dispositivo_electronico:
            context?.dispositivoElectronico ?? false,
          participacion_comunitaria:
            context?.participacionComunitaria ?? false,
          conocimientos_ancestrales:
            context?.conocimientosAncestrales ?? false,
          deserto_siguiente_periodo: outcome.desertoSiguientePeriodo ? 1 : 0,
          estado_resultado: outcome.estadoResultado,
          registrado_en: outcome.registradoEn,
        },
      ];
    });
  }
}
