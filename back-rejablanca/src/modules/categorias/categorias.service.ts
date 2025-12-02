import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { Categoria } from '@prisma/client';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(crearCategoriaDto: CrearCategoriaDto): Promise<Categoria> {
    return this.prisma.categoria.create({
      data: crearCategoriaDto,
    });
  }

  async findAll(): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { esta_activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id, esta_activo: true },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID "${id}" no encontrada.`);
    }
    return categoria;
  }

  async update(id: number, actualizarCategoriaDto: ActualizarCategoriaDto): Promise<Categoria> {
    await this.findOne(id);
    return this.prisma.categoria.update({
      where: { id },
      data: actualizarCategoriaDto,
    });
  }

  async remove(id: number): Promise<Categoria> {
    await this.findOne(id);
    return this.prisma.categoria.update({
      where: { id },
      data: {
        esta_activo: false,
        fecha_eliminado: new Date(),
      },
    });
  }
}