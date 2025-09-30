import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AskForHelp } from './dto/ask-for-help.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HelpService {
  constructor(private prisma: PrismaService) { }

  async quickHelpRequest(dtoQuickHelpRequest: AskForHelp) {
    try {
      const institucion = await this.prisma.institucion.findUnique({
        where: { id: dtoQuickHelpRequest.institucionId },
      });
      if (!institucion) {
        throw new NotFoundException(
          `No se encontró la institución con ID ${dtoQuickHelpRequest.institucionId}`,
        );
      }

      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: dtoQuickHelpRequest.estudianteId },
      });
      if (!estudiante) {
        throw new NotFoundException(
          `No se encontró el estudiante con ID ${dtoQuickHelpRequest.estudianteId}`,
        );
      }

      const createquickHelpRequest = await this.prisma.solicitudAyudaRapida.create({
        data: {
          tipoSolicitante: dtoQuickHelpRequest.tipoSolicitante,
          nombre: dtoQuickHelpRequest.nombre,
          telefono: dtoQuickHelpRequest.telefono,
          email: dtoQuickHelpRequest.email,
          institucion: { connect: { id: dtoQuickHelpRequest.institucionId } },
          estudiante: { connect: { id: dtoQuickHelpRequest.estudianteId } },
          motivo: dtoQuickHelpRequest.motivoSolicitud,
          descripcion: dtoQuickHelpRequest.descripcion,
        },
      });

      return createquickHelpRequest;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Error de referencia a registros inexistentes
        if (error.code === 'P2025') {
          throw new NotFoundException(
            error.meta?.cause || 'Registro relacionado no encontrado',
          );
        }
        // Error de duplicados
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Ya existe una solicitud con este valor único',
          );
        }
      }

      // Log + error genérico
      console.error('❌ Error al crear solicitud de ayuda rápida:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error al procesar la solicitud',
      );
    }
  }

  async getAllquickHelpRequest() {
    const allQuickHelpRequest = await this.prisma.solicitudAyudaRapida.findMany();
    return allQuickHelpRequest;
  }

  async getInstitutions() {
    return this.prisma.institucion.findMany({
      select: {
        id: true,
        nombre: true,
        // otros campos que quieras mostrar
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }

  async getStudents() {
    return this.prisma.estudiante.findMany({
      where: {
        activo: true
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
            identificacion: true,
          },
        },
        institucion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        usuario: {
          nombre: 'asc',
        },
      },
    }).then(estudiantes =>
      estudiantes.map(estudiante => ({
        id: estudiante.id,
        nombre: estudiante.usuario.nombre,
        apellido: estudiante.usuario.apellido,
        email: estudiante.usuario.email,
        grado: estudiante.grado,
        institucionId: estudiante.institucionId
      }))
    );
  }

  async getStudentsByInstitution(institutionId: string) {
    return this.prisma.estudiante.findMany({
      where: { institucionId: institutionId },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        usuario: {
          nombre: 'asc',
        },
      },
    }).then(estudiantes =>
      estudiantes.map(estudiante => ({
        id: estudiante.id,
        nombre: estudiante.usuario.nombre,
        apellido: estudiante.usuario.apellido,
        grado: estudiante.grado
      }))
    );
  }
}
