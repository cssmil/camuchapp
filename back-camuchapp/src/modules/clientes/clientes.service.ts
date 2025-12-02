import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(crearClienteDto: CrearClienteDto, usuarioId: number) {
    return this.prisma.cliente.create({
      data: {
        ...crearClienteDto,
        creado_por: usuarioId,
        actualizado_por: usuarioId,
      },
    });
  }

  async obtenerTodos() {
    return this.prisma.cliente.findMany({
      where: { esta_activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerPorId(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id, esta_activo: true },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID #${id} no encontrado.`);
    }

    return cliente;
  }

  async actualizar(id: number, actualizarClienteDto: ActualizarClienteDto, usuarioId: number) {
    await this.obtenerPorId(id); // Asegurarse de que el cliente existe
    return this.prisma.cliente.update({
      where: { id },
      data: {
        ...actualizarClienteDto,
        actualizado_por: usuarioId,
      },
    });
  }

  async eliminar(id: number, usuarioId: number) {
    await this.obtenerPorId(id); // Asegurarse de que el cliente existe
    return this.prisma.cliente.update({
      where: { id },
      data: {
        esta_activo: false,
        fecha_eliminado: new Date(),
        eliminado_por: usuarioId,
      },
    });
  }
}
