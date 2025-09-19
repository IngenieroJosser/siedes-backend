import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUserDto) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createUsuarioDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    return this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        password: hashedPassword,
      },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        creadoEn: true,
        actualizadoEn: true,
        estudiante: {
          select: {
            id: true,
            grado: true,
            institucion: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        creadoEn: true,
        actualizadoEn: true,
        estudiante: {
          select: {
            id: true,
            edad: true,
            genero: true,
            etnia: true,
            grado: true,
            riesgoDesercion: true,
            institucion: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        solicitudes: {
          select: {
            id: true,
            tipo: true,
            estado: true,
          },
          orderBy: {
            tipo: 'desc',
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async findByEmail(email: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUserDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: updateUsuarioDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    // Si se está actualizando la contraseña, hashear la nueva
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
    });
  }

  async remove(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete: actualizar el campo activo a false
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }

  async countUsersByRole() {
    const roles = Object.values(Rol);
    const counts = {};

    for (const role of roles) {
      counts[role] = await this.prisma.usuario.count({
        where: { rol: role, activo: true },
      });
    }

    return counts;
  }

  async findAllByRole(rol: Rol) {
    return this.prisma.usuario.findMany({
      where: { 
        activo: true,
        rol,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        creadoEn: true,
        actualizadoEn: true,
        estudiante: {
          select: {
            id: true,
            grado: true,
            institucion: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });
  }
}