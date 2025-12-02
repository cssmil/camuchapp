import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearGastoDto } from './dto/crear-gasto.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GastosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(crearGastoDto: CrearGastoDto, usuarioId: number) {
    const { proveedorId, items } = crearGastoDto;

    if (proveedorId) {
      const proveedor = await this.prisma.proveedor.findUnique({
        where: { id: proveedorId, esta_activo: true },
      });
      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID #${proveedorId} no encontrado.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const totalGasto = items.reduce(
        (acc, item) => acc.plus(new Prisma.Decimal(item.costo)),
        new Prisma.Decimal(0),
      );

      const gasto = await tx.gasto.create({
        data: {
          total: totalGasto,
          proveedor_id: proveedorId,
          usuario_id: usuarioId,
          creado_por: usuarioId,
          actualizado_por: usuarioId,
        },
      });

      const detallesParaCrear = items.map((item) => ({
        ...item,
        gasto_id: gasto.id,
      }));

      await tx.detalleGasto.createMany({
        data: detallesParaCrear,
      });

      return tx.gasto.findUnique({
        where: { id: gasto.id },
        include: {
          detalles_gasto: true,
          proveedor: true,
          usuario: {
            select: { id: true, nombre_completo: true },
          },
        },
      });
    });
  }

  async obtenerTodos(fecha_inicio?: string, fecha_fin?: string) {
    const whereClause: any = {};
    if (fecha_inicio && fecha_fin) {
      whereClause.creado_en = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin),
      };
    }

    return this.prisma.gasto.findMany({
      where: whereClause,
      include: {
        detalles_gasto: true,
        proveedor: true,
        usuario: { select: { id: true, nombre_completo: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPorId(id: number) {
    const gasto = await this.prisma.gasto.findUnique({
      where: { id, esta_activo: true },
      include: {
        detalles_gasto: true,
        proveedor: true,
        usuario: { select: { id: true, nombre_completo: true } },
      },
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con ID #${id} no encontrado.`);
    }
    return gasto;
  }

  async anular(gastoId: number, usuarioId: number) {
    const gasto = await this.prisma.gasto.findUnique({
      where: { id: gastoId },
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con ID #${gastoId} no encontrado.`);
    }
    if (!gasto.esta_activo) {
      throw new BadRequestException(`El gasto con ID #${gastoId} ya ha sido anulado.`);
    }

    return this.prisma.gasto.update({
      where: { id: gastoId },
      data: {
        esta_activo: false,
        fecha_eliminado: new Date(),
        eliminado_por: usuarioId,
      },
    });
  }
}
