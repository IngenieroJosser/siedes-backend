import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateInstitutionReportDto } from './dto/create-report.dto';
import { UpdateInstitutionReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private rate(desertores: number, matricula: number) {
    if (matricula <= 0 || desertores > matricula) throw new BadRequestException('Valores de matrícula/desertores inválidos');
    return (desertores / matricula) * 100;
  }

  async create(dto: CreateInstitutionReportDto) {
    const institution = await this.prisma.institucion.findUnique({ where: { id: dto.institucionId } });
    if (!institution) throw new NotFoundException('Institución no encontrada');
    const tasa = this.rate(dto.desertoresConfirmados, dto.matriculaCorte);
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.reporteInstitucional.create({
        data: {
          institucionId: dto.institucionId,
          anio: dto.anio,
          periodo: dto.periodo,
          fechaCorte: new Date(dto.fechaCorte),
          matriculaCorte: dto.matriculaCorte,
          desertoresConfirmados: dto.desertoresConfirmados,
          tasaDesercion: tasa,
          nivelRiesgoObservado: dto.nivelRiesgoObservado,
          fuente: dto.fuente ?? 'OPERACIONAL',
          observaciones: dto.observaciones,
          finalizado: dto.finalizado ?? false,
          finalizadoEn: dto.finalizado ? new Date() : null,
        },
        include: { institucion: true },
      });
      await tx.mlOutboxEvent.create({
        data: {
          eventType: report.finalizado ? 'REPORT_FINALIZED' : 'REPORT_CREATED',
          aggregateType: 'ReporteInstitucional',
          aggregateId: report.id,
          institutionId: report.institucionId,
          payload: { anio: report.anio, periodo: report.periodo, finalizado: report.finalizado },
        },
      });
      return report;
    });
  }

  findAll() {
    return this.prisma.reporteInstitucional.findMany({ include: { institucion: true }, orderBy: [{ anio: 'desc' }, { periodo: 'desc' }] });
  }

  async findOne(id: string) {
    const report = await this.prisma.reporteInstitucional.findUnique({ where: { id }, include: { institucion: true } });
    if (!report) throw new NotFoundException('Reporte no encontrado');
    return report;
  }

  async update(id: string, dto: UpdateInstitutionReportDto) {
    const current = await this.findOne(id);
    const matricula = dto.matriculaCorte ?? current.matriculaCorte;
    const desertores = dto.desertoresConfirmados ?? current.desertoresConfirmados;
    const tasa = this.rate(desertores, matricula);
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.reporteInstitucional.update({
        where: { id },
        data: {
          ...(dto.institucionId ? { institucionId: dto.institucionId } : {}),
          ...(dto.anio ? { anio: dto.anio } : {}),
          ...(dto.periodo ? { periodo: dto.periodo } : {}),
          ...(dto.fechaCorte ? { fechaCorte: new Date(dto.fechaCorte) } : {}),
          matriculaCorte: matricula,
          desertoresConfirmados: desertores,
          tasaDesercion: tasa,
          ...(dto.nivelRiesgoObservado ? { nivelRiesgoObservado: dto.nivelRiesgoObservado } : {}),
          ...(dto.fuente !== undefined ? { fuente: dto.fuente } : {}),
          ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
        },
      });
      await tx.mlOutboxEvent.create({
        data: { eventType: 'REPORT_UPDATED', aggregateType: 'ReporteInstitucional', aggregateId: id, institutionId: report.institucionId, payload: { anio: report.anio, periodo: report.periodo } },
      });
      return report;
    });
  }

  async finalize(id: string) {
    const current = await this.findOne(id);
    if (current.finalizado) return current;
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.reporteInstitucional.update({
        where: { id },
        data: { finalizado: true, finalizadoEn: new Date() },
        include: { institucion: true },
      });
      await tx.mlOutboxEvent.create({
        data: {
          eventType: 'REPORT_FINALIZED',
          aggregateType: 'ReporteInstitucional',
          aggregateId: id,
          institutionId: report.institucionId,
          payload: { anio: report.anio, periodo: report.periodo, tasaDesercion: report.tasaDesercion, nivelRiesgoObservado: report.nivelRiesgoObservado },
        },
      });
      return report;
    });
  }
}
