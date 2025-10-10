import { 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAlertaDesercionDto } from './dto/create-alerts.dto';
import { UpdateAlertaDesercionDto } from './dto/update-alerts.dto';
import { FilterAlertsDto } from './dto/filter-alerts.dto';
import { NivelRiesgo } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAlert(createAlertDto: CreateAlertaDesercionDto) {
    try {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: createAlertDto.estudianteId },
        include: { usuario: true }
      });

      if (!estudiante) {
        throw new NotFoundException('El estudiante no existe');
      }

      const alerta = await this.prisma.alertaDesercion.create({
        data: {
          ...createAlertDto,
          revisada: createAlertDto.revisada || false,
          fechaRevision: createAlertDto.revisada && createAlertDto.fechaRevision ? new Date(createAlertDto.fechaRevision) : null,

        },
        include: {
          estudiante: {
            include: {
              usuario: true,
              institucion: true,
              contexto: true
            }
          }
        }
      });

      return alerta;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la alerta');
    }
  }

  async findAllAlerts(filterAlertsDto?: FilterAlertsDto) {
    try {
      const where: any = {};

      // Aplicar filtros si se proporcionan
      if (filterAlertsDto) {
        if (filterAlertsDto.nivelRiesgo) {
          where.nivelRiesgo = filterAlertsDto.nivelRiesgo;
        }

        if (filterAlertsDto.revisada !== undefined) {
          where.revisada = filterAlertsDto.revisada;
        }

        if (filterAlertsDto.estudianteId) {
          where.estudianteId = filterAlertsDto.estudianteId;
        }

        if (filterAlertsDto.fechaInicio || filterAlertsDto.fechaFin) {
          where.creadaEn = {};
          if (filterAlertsDto.fechaInicio) {
            where.creadaEn.gte = new Date(filterAlertsDto.fechaInicio);
          }
          if (filterAlertsDto.fechaFin) {
            where.creadaEn.lte = new Date(filterAlertsDto.fechaFin);
          }
        }

        if (filterAlertsDto.search) {
          where.OR = [
            { descripcion: { contains: filterAlertsDto.search, mode: 'insensitive' } },
            { factores: { has: filterAlertsDto.search } }
          ];
        }
      }

      const alertas = await this.prisma.alertaDesercion.findMany({
        where,
        include: {
          estudiante: {
            include: {
              usuario: true,
              institucion: true,
              contexto: true
            }
          }
        },
        orderBy: {
          creadaEn: 'desc'
        }
      });

      return alertas;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las alertas');
    }
  }

  async findOne(id: string) {
    try {
      const alerta = await this.prisma.alertaDesercion.findUnique({
        where: { id },
        include: {
          estudiante: {
            include: {
              usuario: true,
              institucion: true,
              contexto: true,
              registros: {
                orderBy: { creadoEn: 'desc' },
                take: 5
              }
            }
          }
        }
      });

      if (!alerta) {
        throw new NotFoundException('Alerta no encontrada');
      }

      return alerta;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la alerta');
    }
  }

  async updateAlert(id: string, updateAlertDto: UpdateAlertaDesercionDto) {
    try {
      // Verificar que la alerta existe
      const alertaExistente = await this.prisma.alertaDesercion.findUnique({
        where: { id }
      });

      if (!alertaExistente) {
        throw new NotFoundException('Alerta no encontrada');
      }

      // Si se está actualizando el estudiante, verificar que existe
      if (updateAlertDto.estudianteId) {
        const estudiante = await this.prisma.estudiante.findUnique({
          where: { id: updateAlertDto.estudianteId }
        });

        if (!estudiante) {
          throw new NotFoundException('El estudiante no existe');
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateAlertDto };

      // Si se marca como revisada y no tiene fecha de revisión, asignar fecha actual
      if (updateAlertDto.revisada && !updateAlertDto.fechaRevision) {
        updateData.fechaRevision = new Date();
      }

      // Si se desmarca como revisada, limpiar fecha de revisión
      if (updateAlertDto.revisada === false) {
        updateData.fechaRevision = null;
      }

      const alertaActualizada = await this.prisma.alertaDesercion.update({
        where: { id },
        data: updateData,
        include: {
          estudiante: {
            include: {
              usuario: true,
              institucion: true,
              contexto: true
            }
          }
        }
      });

      return alertaActualizada;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la alerta');
    }
  }

  async removeAlert(id: string) {
    try {
      // Verificar que la alerta existe
      const alerta = await this.prisma.alertaDesercion.findUnique({
        where: { id }
      });

      if (!alerta) {
        throw new NotFoundException('Alerta no encontrada');
      }

      await this.prisma.alertaDesercion.delete({
        where: { id }
      });

      return { message: 'Alerta eliminada correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la alerta');
    }
  }

  async markAsReviewed(id: string) {
    try {
      const alerta = await this.prisma.alertaDesercion.findUnique({
        where: { id }
      });

      if (!alerta) {
        throw new NotFoundException('Alerta no encontrada');
      }

      const alertaActualizada = await this.prisma.alertaDesercion.update({
        where: { id },
        data: {
          revisada: true,
          fechaRevision: new Date()
        },
        include: {
          estudiante: {
            include: {
              usuario: true,
              institucion: true
            }
          }
        }
      });

      return alertaActualizada;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al marcar la alerta como revisada');
    }
  }

  async getAlertsByStudent(estudianteId: string) {
    try {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: estudianteId }
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      const alertas = await this.prisma.alertaDesercion.findMany({
        where: { estudianteId },
        include: {
          estudiante: {
            include: {
              usuario: true,
              institucion: true
            }
          }
        },
        orderBy: {
          creadaEn: 'desc'
        }
      });

      return alertas;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener las alertas del estudiante');
    }
  }

  async getAlertsStats() {
    try {
      const total = await this.prisma.alertaDesercion.count();
      const revisadas = await this.prisma.alertaDesercion.count({
        where: { revisada: true }
      });
      const noRevisadas = total - revisadas;

      // Estadísticas por nivel de riesgo
      const porNivelRiesgo = await this.prisma.alertaDesercion.groupBy({
        by: ['nivelRiesgo'],
        _count: {
          _all: true
        }
      });

      // Alertas de los últimos 7 días
      const unaSemanaAtras = new Date();
      unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

      const alertasRecientes = await this.prisma.alertaDesercion.count({
        where: {
          creadaEn: {
            gte: unaSemanaAtras
          }
        }
      });

      return {
        total,
        revisadas,
        noRevisadas,
        porNivelRiesgo: porNivelRiesgo.reduce((acc, item) => {
          acc[item.nivelRiesgo] = item._count._all;
          return acc;
        }, {}),
        alertasRecientes
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener estadísticas de alertas');
    }
  }

  async getCriticalAlerts() {
    try {
      const alertasCriticas = await this.prisma.alertaDesercion.findMany({
        where: {
          nivelRiesgo: NivelRiesgo.CRITICO,
          revisada: false
        },
        include: {
          estudiante: {
            include: {
              usuario: true,
              institucion: true,
              contexto: true
            }
          }
        },
        orderBy: {
          creadaEn: 'desc'
        }
      });

      return alertasCriticas;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener alertas críticas');
    }
  }
}
