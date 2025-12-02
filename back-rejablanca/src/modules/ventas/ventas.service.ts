import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { Prisma } from '@prisma/client';

// Interfaz para el objeto de datos temporal
interface DetalleVentaTemporal {
  producto_id: number;
  cantidad: number;
  precio_unitario: Prisma.Decimal;
}

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(crearVentaDto: CrearVentaDto, usuarioId: number) {
    const { clienteId, items } = crearVentaDto;

    const stockItems = items.filter((item) => item.productoId);
    const freeItems = items.filter((item) => !item.productoId);

    // 1. Validar productos de stock y obtener sus datos
    // Se usa "!" porque el filtro anterior asegura que productoId no es undefined.
    const idsProductos = stockItems.map((item) => item.productoId!);
    const productosEnDB = await this.prisma.producto.findMany({
      where: {
        id: { in: idsProductos },
        esta_activo: true,
      },
    });

    if (productosEnDB.length !== idsProductos.length) {
      throw new NotFoundException(
        'Uno o más productos de inventario no fueron encontrados o no están activos.',
      );
    }

    // 2. Iniciar transacción
    return this.prisma.$transaction(async (tx) => {
      let totalVenta = new Prisma.Decimal(0);
      // Usamos un tipo intermedio que no requiere venta_id aún.
      const detallesParaCrear: Omit<Prisma.DetalleVentaCreateManyInput, 'venta_id'>[] = [];

      // 3. Procesar productos de stock
      for (const item of stockItems) {
        const productoDB = productosEnDB.find((p) => p.id === item.productoId);

        if (!productoDB) {
          throw new NotFoundException(
            `Producto con ID #${item.productoId} no encontrado durante la transacción.`,
          );
        }

        if (productoDB.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto: ${productoDB.nombre}. Stock actual: ${productoDB.stock}`,
          );
        }

        const precioUnitario = item.precioUnitario
          ? new Prisma.Decimal(item.precioUnitario)
          : productoDB.precio;

        const subtotal = precioUnitario.times(item.cantidad);
        totalVenta = totalVenta.plus(subtotal);

        detallesParaCrear.push({
          producto_id: item.productoId,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario,
          descripcion_libre: null, // Es un producto de stock
        });
      }

      // 4. Procesar productos libres
      for (const item of freeItems) {
        if (!item.descripcionLibre || !item.precioUnitario) {
          throw new BadRequestException(
            'Los artículos de venta libre deben tener una descripción y un precio unitario.',
          );
        }
        const precioUnitario = new Prisma.Decimal(item.precioUnitario);
        const subtotal = precioUnitario.times(item.cantidad);
        totalVenta = totalVenta.plus(subtotal);

        detallesParaCrear.push({
          producto_id: null, // No es un producto de stock
          cantidad: item.cantidad,
          precio_unitario: precioUnitario,
          descripcion_libre: item.descripcionLibre,
        });
      }

      // 5. Crear la Venta
      const venta = await tx.venta.create({
        data: {
          total: totalVenta,
          usuario_id: usuarioId,
          cliente_id: clienteId,
          creado_por: usuarioId,
          actualizado_por: usuarioId,
        },
      });

      // 6. Crear los Detalles de la Venta
      const dataConVentaId = detallesParaCrear.map((detalle) => ({
        ...detalle,
        venta_id: venta.id,
      }));
      await tx.detalleVenta.createMany({
        data: dataConVentaId,
      });

      // 7. Actualizar el stock de cada producto de inventario
      for (const item of stockItems) {
        await tx.producto.update({
          where: { id: item.productoId! }, // "!" es seguro por el filtro inicial
          data: {
            stock: {
              decrement: item.cantidad,
            },
          },
        });
      }

      // 8. Devolver la venta completa
      return tx.venta.findUnique({
        where: { id: venta.id },
        include: {
          detalles_venta: {
            include: {
              producto: true,
            },
          },
          cliente: true,
          usuario: {
            select: { id: true, nombre_completo: true, email: true },
          },
        },
      });
    });
  }

  async obtenerTodas(fecha_inicio?: string, fecha_fin?: string) {
    const whereClause: any = {};
    if (fecha_inicio && fecha_fin) {
      whereClause.creado_en = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin),
      };
    }

    return this.prisma.venta.findMany({
      where: whereClause,
      include: {
        cliente: true,
        usuario: { select: { id: true, nombre_completo: true } },
        detalles_venta: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPorId(id: number) {
    const venta = await this.prisma.venta.findUnique({
      where: { id, esta_activo: true },
      include: {
        detalles_venta: {
          include: {
            producto: true,
          },
        },
        cliente: true,
        usuario: {
          select: { id: true, nombre_completo: true, email: true },
        },
      },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID #${id} no encontrada.`);
    }

    return venta;
  }

  async anular(ventaId: number, usuarioId: number) {
    // 1. Obtener la venta y sus detalles
    const venta = await this.prisma.venta.findUnique({
      where: { id: ventaId },
      include: { detalles_venta: true },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID #${ventaId} no encontrada.`);
    }
    if (!venta.esta_activo) {
      throw new BadRequestException(`La venta con ID #${ventaId} ya ha sido anulada.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 2. Restaurar el stock de los productos
      for (const detalle of venta.detalles_venta) {
        if (detalle.producto_id) {
          await tx.producto.update({
            where: { id: detalle.producto_id },
            data: {
              stock: {
                increment: detalle.cantidad,
              },
            },
          });
        }
      }

      // 3. Marcar la venta como anulada (esta_activo = false)
      const ventaAnulada = await tx.venta.update({
        where: { id: ventaId },
        data: {
          esta_activo: false,
          fecha_eliminado: new Date(),
          eliminado_por: usuarioId,
        },
      });

      return ventaAnulada;
    });
  }
}
