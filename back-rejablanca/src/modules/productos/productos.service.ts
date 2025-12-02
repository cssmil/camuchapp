import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { HistorialProducto, Producto, TipoEventoProducto } from '@prisma/client';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    crearProductoDto: CrearProductoDto,
    usuario_id: number,
    file?: Express.Multer.File,
  ): Promise<Producto> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: crearProductoDto.categoria_id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    let foto_url: string | null = null;
    let emoji_url: string | null = null;

    if (file) {
      foto_url = `/uploads/${file.filename}`;
    } else {
      emoji_url = categoria.emoji;
    }

    const totalProductosEnCategoria = await this.prisma.producto.count({
      where: { categoria_id: crearProductoDto.categoria_id },
    });

    const codigoCategoria = categoria.nombre.substring(0, 3).toUpperCase();
    const numeroProducto = (totalProductosEnCategoria + 1)
      .toString()
      .padStart(3, '0');
    const codigo_producto = `${codigoCategoria}-${numeroProducto}`;

    return this.prisma.$transaction(async (prisma) => {
      const nuevoProducto = await prisma.producto.create({
        data: {
          ...crearProductoDto,
          fecha_vencimiento: crearProductoDto.fecha_vencimiento 
            ? new Date(crearProductoDto.fecha_vencimiento) 
            : null,
          codigo_producto,
          foto_url,
          emoji_url,
          creado_por: usuario_id,
          actualizado_por: usuario_id,
        },
      });

      await prisma.historialProducto.create({
        data: {
          producto_id: nuevoProducto.id,
          usuario_id: usuario_id,
          tipo_evento: TipoEventoProducto.CREACION,
          cantidad: nuevoProducto.stock,
        },
      });

      return nuevoProducto;
    });
  }

  async addStock(producto_id: number, cantidad: number, usuario_id: number): Promise<Producto> {
    return this.prisma.$transaction(async (prisma) => {
      const productoActualizado = await prisma.producto.update({
        where: { id: producto_id },
        data: {
          stock: {
            increment: cantidad,
          },
          actualizado_por: usuario_id,
        },
      });

      await prisma.historialProducto.create({
        data: {
          producto_id: producto_id,
          usuario_id: usuario_id,
          tipo_evento: TipoEventoProducto.AUMENTO_STOCK,
          cantidad: cantidad,
        },
      });

      return productoActualizado;
    });
  }

  async getHistory(producto_id: number): Promise<HistorialProducto[]> {
    return this.prisma.historialProducto.findMany({
      where: { producto_id },
      include: {
        usuario: {
          select: {
            nombre_completo: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  async getAllHistory(): Promise<HistorialProducto[]> {
    return this.prisma.historialProducto.findMany({
      include: {
        producto: {
          include: {
            categoria: true,
          },
        },
        usuario: {
          select: {
            nombre_completo: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  async findAll(): Promise<Producto[]> {
    return this.prisma.producto.findMany({
      where: { esta_activo: true },
      include: {
        categoria: true,
        proveedor: true,
      },
      orderBy: {
        creado_en: 'desc',
      },
    });
  }

  async buscar(termino: string): Promise<Producto[]> {
    return this.prisma.producto.findMany({
      where: {
        esta_activo: true,
        OR: [
          {
            nombre: {
              contains: termino,
            },
          },
          {
            codigo_producto: {
              contains: termino,
            },
          },
        ],
      },
      include: {
        categoria: true,
        proveedor: true,
      },
      take: 10,
    });
  }

  async obtenerProductosPorVencer(dias = 15): Promise<Producto[]> {
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + dias);

    return this.prisma.producto.findMany({
      where: {
        esta_activo: true,
        fecha_vencimiento: {
          gte: hoy,
          lte: fechaLimite,
        },
      },
      include: {
        categoria: true,
        proveedor: true,
      },
      orderBy: {
        fecha_vencimiento: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.prisma.producto.findUnique({
      where: { id: Number(id), esta_activo: true },
      include: {
        categoria: true,
        proveedor: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }
    return producto;
  }

  async update(
    id: number,
    actualizarProductoDto: ActualizarProductoDto,
    usuario_id: number,
    file?: Express.Multer.File,
  ): Promise<Producto> {
    const productoExistente = await this.findOne(id);

    let foto_url: string | null = productoExistente.foto_url;
    let emoji_url: string | null = productoExistente.emoji_url;

    if (file) {
      foto_url = `/uploads/${file.filename}`;
      emoji_url = null; // Si se sube foto, se quita el emoji
    } else if (actualizarProductoDto.categoria_id && actualizarProductoDto.categoria_id !== productoExistente.categoria_id) {
      // Si cambia la categoría y no hay foto, actualizamos el emoji
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: actualizarProductoDto.categoria_id },
      });
      if (categoria) {
        emoji_url = categoria.emoji;
        foto_url = null; // Si se cambia a una categoría con emoji, se quita la foto
      }
    }

    const dataToUpdate: any = { 
      ...actualizarProductoDto, 
      actualizado_por: usuario_id,
      foto_url,
      emoji_url,
    };

    if (actualizarProductoDto.fecha_vencimiento) {
      dataToUpdate.fecha_vencimiento = new Date(actualizarProductoDto.fecha_vencimiento);
    } else if (actualizarProductoDto.fecha_vencimiento === null) {
      dataToUpdate.fecha_vencimiento = null;
    }

    return this.prisma.producto.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });
  }

  async remove(id: number, usuario_id: number): Promise<Producto> {
    await this.findOne(id);
    return this.prisma.$transaction(async (prisma) => {
      const productoEliminado = await prisma.producto.update({
        where: { id: Number(id) },
        data: {
          esta_activo: false,
          fecha_eliminado: new Date(),
          eliminado_por: usuario_id,
        },
      });

      await prisma.historialProducto.create({
        data: {
          producto_id: id,
          usuario_id: usuario_id,
          tipo_evento: TipoEventoProducto.ELIMINACION,
          cantidad: 0,
        },
      });

      return productoEliminado;
    });
  }
}

