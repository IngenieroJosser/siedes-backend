import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionService {
  constructor(private prisma: PrismaService) {}

  async createInstitution(dtoInstitution: CreateInstitutionDto) {
    const findInstitution = await this.prisma.institucion.findFirst({
      where: {
        nombre: dtoInstitution.nombre,
        ciudad: dtoInstitution.ciudad
      }
    });

    if (findInstitution) {
      throw new ConflictException(
        `La institución "${dtoInstitution.nombre}" ya existe en ${dtoInstitution.ciudad}`
      );
    }

    return this.prisma.institucion.create({
      data: {
        nombre: dtoInstitution.nombre,
        direccion: dtoInstitution.direccion,
        ciudad: dtoInstitution.ciudad,
        departamento: dtoInstitution.departamento,
        tipo: dtoInstitution.tipo,
        codigoDANE: dtoInstitution.codigoDANE
      }
    });
  }

  async getAllInstitution() {
    const foundInstitution = await this.prisma.institucion.findMany();
    return foundInstitution;
  }

  async getInstitutionById(id: string) {
    const foundInstitutionById = await this.prisma.institucion.findUnique({
      where: { id }
    });
  
    if (!foundInstitutionById) {
      throw new NotFoundException(
        `La institución con id ${id} no existe en la base de datos`
      );
    }
  
    return foundInstitutionById;
  }
  
  async updateInstitution(id: string, dtoUpdateInstitution: UpdateInstitutionDto) {
    const institution = await this.prisma.institucion.findUnique({ where: { id } });
  
    if (!institution) {
      throw new NotFoundException(
        `La institución con id ${id} no existe`
      );
    }
  
    return this.prisma.institucion.update({
      where: { id },
      data: { ...dtoUpdateInstitution }
    });
  }

  async removeInstitution(id: string) {
    const institution = await this.prisma.institucion.findUnique({
      where: { id }
    });

    if (!institution || institution.deletedAt) {
      throw new NotFoundException(
        `La institución con id ${id} no existe o ya fue eliminada`
      );
    }

    return this.prisma.institucion.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }
}
