import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { ActualizarProveedorDto } from './dto/actualizar-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  crear(crearProveedorDto: CrearProveedorDto) {
    return this.prisma.proveedor.create({ data: crearProveedorDto });
  }

  obtenerTodos() {
    return this.prisma.proveedor.findMany({ where: { esta_activo: true } });
  }

  async obtenerPorId(id: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id, esta_activo: true },
    });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID #${id} no encontrado.`);
    }
    return proveedor;
  }

  async actualizar(id: number, actualizarProveedorDto: ActualizarProveedorDto) {
    await this.obtenerPorId(id);
    return this.prisma.proveedor.update({
      where: { id },
      data: actualizarProveedorDto,
    });
  }

  async eliminar(id: number) {
    await this.obtenerPorId(id);
    return this.prisma.proveedor.update({
      where: { id },
      data: { esta_activo: false, fecha_eliminado: new Date() },
    });
  }
}
