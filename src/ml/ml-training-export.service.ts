import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

function mean(values: Array<number | null | undefined>): number | null {
  const valid = values.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function pctTrue(values: Array<boolean | null | undefined>): number | null {
  const valid = values.filter((x): x is boolean => typeof x === 'boolean');
  if (!valid.length) return null;
  return (valid.filter(Boolean).length / valid.length) * 100;
}

@Injectable()
export class MlTrainingExportService {
  constructor(private readonly prisma: PrismaService) {}

  async buildSnapshot() {
    const reports = await this.prisma.reporteInstitucional.findMany({
      where: { finalizado: true },
      include: { institucion: true },
      orderBy: [{ anio: 'asc' }, { periodo: 'asc' }],
    });

    const rows: Record<string, unknown>[] = [];
    for (const report of reports) {
      const students = await this.prisma.estudiante.findMany({
        where: {
          institucionId: report.institucionId,
          creadoEn: { lte: report.fechaCorte },
        },
        include: {
          contexto: true,
          registros: {
            where: { creadoEn: { lte: report.fechaCorte } },
            orderBy: { creadoEn: 'desc' },
            take: 1,
          },
          alertas: {
            where: { creadaEn: { lte: report.fechaCorte } },
            select: { nivelRiesgo: true, revisada: true },
          },
          intervenciones: {
            where: { creadoEn: { lte: report.fechaCorte } },
            select: { estado: true, efectividad: true },
          },
        },
      });

      const contexts = students.map((s) => s.contexto);
      const academic = students.map((s) => s.registros[0]).filter(Boolean);
      const alerts = students.flatMap((s) => s.alertas);
      const interventions = students.flatMap((s) => s.intervenciones);

      const internetAccessPct = pctTrue(contexts.map((c) => c?.accesoInternet));

      rows.push({
        source: 'backend_operational',
        dato_sintetico: false,
        report_id: report.id,
        anio: report.anio,
        periodo: report.periodo,
        fecha_corte: report.fechaCorte.toISOString(),
        codigo_dane_establecimiento: report.institucion.codigoDANE,
        institucion_id: report.institucionId,
        institucion_educativa: report.institucion.nombre,
        tipo_establecimiento: report.institucion.tipo,
        ciudad: report.institucion.ciudad,
        matricula_corte: report.matriculaCorte,
        edad_promedio: mean(students.map((s) => s.edad)),
        pct_afrodescendiente_auditoria: students.length
          ? (students.filter((s) => s.etnia === 'AFRODESCENDIENTE').length / students.length) * 100
          : null,
        pct_indigena_auditoria: students.length
          ? (students.filter((s) => s.etnia === 'INDIGENA').length / students.length) * 100
          : null,
        pct_sin_internet_hogar: internetAccessPct === null ? null : 100 - internetAccessPct,
        pct_estudiantes_trabajan: pctTrue(contexts.map((c) => c?.trabaja)),
        apoyo_familiar_pct: pctTrue(contexts.map((c) => c?.apoyoFamiliar)),
        distancia_promedio_hogar_ie_km: mean(contexts.map((c) => c?.distanciaEscuela)),
        tiempo_desplazamiento_promedio_min: mean(contexts.map((c) => c?.tiempoDesplazamiento)),
        promedio_academico: mean(academic.map((a) => a.promedio)),
        inasistencias_promedio: mean(academic.map((a) => a.inasistencias)),
        materias_reprobadas_promedio: mean(academic.map((a) => a.materiasReprobadas)),
        comportamiento_promedio: mean(academic.map((a) => a.comportamiento)),
        // Campos de tratamiento/retroalimentación: se exportan para auditoría, no como features por defecto.
        alertas_total_contexto: alerts.length,
        pct_alertas_revisadas_contexto: alerts.length
          ? (alerts.filter((a) => a.revisada).length / alerts.length) * 100
          : null,
        intervenciones_total_contexto: interventions.length,
        efectividad_intervenciones_contexto: mean(interventions.map((i) => i.efectividad)),
        target_desertores_fin_periodo: report.desertoresConfirmados,
        target_tasa_desercion_fin_periodo_pct: report.tasaDesercion,
        target_nivel_riesgo_ie: report.nivelRiesgoObservado,
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      source: 'siedes-backend',
      labeledInstitutionRows: rows.length,
      rows,
    };
  }
}
