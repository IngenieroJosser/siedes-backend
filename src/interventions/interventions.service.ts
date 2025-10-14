import { 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateIntervencionDto } from './dto/create-interventions.dto';
import { UpdateIntervencionDto } from './dto/update-interventions.dto';
import { FilterIntervencionesDto } from './dto/filter-interventions.dto';
import { TipoIntervencion, EstadoIntervencion } from '@prisma/client';

@Injectable()
export class InterventionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIntervencionDto: CreateIntervencionDto) {
    try {
      // Verificar que el estudiante existe
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: createIntervencionDto.estudianteId },
        include: { usuario: true }
      });

      if (!estudiante) {
        throw new NotFoundException('El estudiante no existe');
      }

      const intervencion = await this.prisma.intervencion.create({
        data: {
          ...createIntervencionDto,
          estado: createIntervencionDto.estado || EstadoIntervencion.ACTIVA,
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

      return intervencion;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la intervención');
    }
  }

  async findAll(filterIntervencionesDto?: FilterIntervencionesDto) {
    try {
      const where: any = {};

      // Aplicar filtros si se proporcionan
      if (filterIntervencionesDto) {
        if (filterIntervencionesDto.tipo) {
          where.tipo = filterIntervencionesDto.tipo;
        }

        if (filterIntervencionesDto.estado) {
          where.estado = filterIntervencionesDto.estado;
        }

        if (filterIntervencionesDto.estudianteId) {
          where.estudianteId = filterIntervencionesDto.estudianteId;
        }

        if (filterIntervencionesDto.fechaInicio || filterIntervencionesDto.fechaFin) {
          where.fechaInicio = {};
          if (filterIntervencionesDto.fechaInicio) {
            where.fechaInicio.gte = new Date(filterIntervencionesDto.fechaInicio);
          }
          if (filterIntervencionesDto.fechaFin) {
            where.fechaInicio.lte = new Date(filterIntervencionesDto.fechaFin);
          }
        }

        if (filterIntervencionesDto.search) {
          where.OR = [
            { descripcion: { contains: filterIntervencionesDto.search, mode: 'insensitive' } },
            { observaciones: { contains: filterIntervencionesDto.search, mode: 'insensitive' } }
          ];
        }

        if (filterIntervencionesDto.institucionId) {
          where.estudiante = {
            institucionId: filterIntervencionesDto.institucionId
          };
        }
      }

      const intervenciones = await this.prisma.intervencion.findMany({
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
          creadoEn: 'desc'
        }
      });

      return intervenciones;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las intervenciones');
    }
  }

  async findOne(id: string) {
    try {
      const intervencion = await this.prisma.intervencion.findUnique({
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
              },
              alertas: {
                where: { revisada: false },
                orderBy: { creadaEn: 'desc' }
              }
            }
          }
        }
      });

      if (!intervencion) {
        throw new NotFoundException('Intervención no encontrada');
      }

      return intervencion;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la intervención');
    }
  }

  async update(id: string, updateIntervencionDto: UpdateIntervencionDto) {
    try {
      // Verificar que la intervención existe
      const intervencionExistente = await this.prisma.intervencion.findUnique({
        where: { id }
      });

      if (!intervencionExistente) {
        throw new NotFoundException('Intervención no encontrada');
      }

      // Si se está actualizando el estudiante, verificar que existe
      if (updateIntervencionDto.estudianteId) {
        const estudiante = await this.prisma.estudiante.findUnique({
          where: { id: updateIntervencionDto.estudianteId }
        });

        if (!estudiante) {
          throw new NotFoundException('El estudiante no existe');
        }
      }

      // Validar fechas
      if (updateIntervencionDto.fechaFin && updateIntervencionDto.fechaInicio) {
        const fechaInicio = updateIntervencionDto.fechaInicio instanceof Date 
          ? updateIntervencionDto.fechaInicio 
          : new Date(updateIntervencionDto.fechaInicio);
        const fechaFin = updateIntervencionDto.fechaFin instanceof Date 
          ? updateIntervencionDto.fechaFin 
          : new Date(updateIntervencionDto.fechaFin);

        if (fechaFin < fechaInicio) {
          throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
        }
      }

      const intervencionActualizada = await this.prisma.intervencion.update({
        where: { id },
        data: updateIntervencionDto,
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

      return intervencionActualizada;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la intervención');
    }
  }

  async remove(id: string) {
    try {
      // Verificar que la intervención existe
      const intervencion = await this.prisma.intervencion.findUnique({
        where: { id }
      });

      if (!intervencion) {
        throw new NotFoundException('Intervención no encontrada');
      }

      await this.prisma.intervencion.delete({
        where: { id }
      });

      return { message: 'Intervención eliminada correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la intervención');
    }
  }

  async getIntervencionesByStudent(estudianteId: string) {
    try {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: estudianteId }
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      const intervenciones = await this.prisma.intervencion.findMany({
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
          creadoEn: 'desc'
        }
      });

      return intervenciones;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener las intervenciones del estudiante');
    }
  }

  async getIntervencionesStats() {
    try {
      const total = await this.prisma.intervencion.count();
      
      // Estadísticas por estado
      const porEstado = await this.prisma.intervencion.groupBy({
        by: ['estado'],
        _count: {
          _all: true
        },
        _avg: {
          efectividad: true
        }
      });

      // Estadísticas por tipo
      const porTipo = await this.prisma.intervencion.groupBy({
        by: ['tipo'],
        _count: {
          _all: true
        },
        _avg: {
          efectividad: true
        }
      });

      // Intervenciones de los últimos 30 días
      const treintaDiasAtras = new Date();
      treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

      const intervencionesRecientes = await this.prisma.intervencion.count({
        where: {
          creadoEn: {
            gte: treintaDiasAtras
          }
        }
      });

      // Efectividad promedio
      const efectividadPromedio = await this.prisma.intervencion.aggregate({
        _avg: {
          efectividad: true
        }
      });

      return {
        total,
        porEstado: porEstado.reduce((acc, item) => {
          acc[item.estado] = {
            count: item._count._all,
            efectividadPromedio: item._avg.efectividad
          };
          return acc;
        }, {}),
        porTipo: porTipo.reduce((acc, item) => {
          acc[item.tipo] = {
            count: item._count._all,
            efectividadPromedio: item._avg.efectividad
          };
          return acc;
        }, {}),
        intervencionesRecientes,
        efectividadPromedio: efectividadPromedio._avg.efectividad || 0
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener estadísticas de intervenciones');
    }
  }

  async markAsCompleted(id: string) {
    try {
      const intervencion = await this.prisma.intervencion.findUnique({
        where: { id }
      });

      if (!intervencion) {
        throw new NotFoundException('Intervención no encontrada');
      }

      const intervencionActualizada = await this.prisma.intervencion.update({
        where: { id },
        data: {
          estado: EstadoIntervencion.COMPLETADA,
          fechaFin: new Date()
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

      return intervencionActualizada;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al marcar la intervención como completada');
    }
  }
}
