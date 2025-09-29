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
  constructor(private prisma: PrismaService) {}

  async quickHelpRequest(dto: AskForHelp) {
    try {
      const institucion = await this.prisma.institucion.findUnique({
        where: { id: dto.institucionId },
      });
      if (!institucion) {
        throw new NotFoundException(
          `No se encontró la institución con ID ${dto.institucionId}`,
        );
      }

      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: dto.estudianteId },
      });
      if (!estudiante) {
        throw new NotFoundException(
          `No se encontró el estudiante con ID ${dto.estudianteId}`,
        );
      }

      const createquickHelpRequest = await this.prisma.solicitudAyudaRapida.create({
          data: {
            tipoSolicitante: dto.tipoSolicitante,
            nombre: dto.nombre,
            telefono: dto.telefono,
            email: dto.email,
            institucion: { connect: { id: dto.institucionId } },
            estudiante: { connect: { id: dto.estudianteId } },
            motivo: dto.motivoSolicitud,
            descripcion: dto.descripcion,
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
}
