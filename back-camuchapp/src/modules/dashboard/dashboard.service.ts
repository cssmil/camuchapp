
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfDay, subDays, format, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Producto } from '@prisma/client';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productosService: ProductosService,
  ) {}

  private parseDate = (date: string | Date): Date => {
    return typeof date === 'string' ? new Date(date) : date;
  }

  async getSummary(fecha_inicio?: string, fecha_fin?: string) {
    const whereClause: any = { esta_activo: true };
    if (fecha_inicio && fecha_fin) {
      whereClause.creado_en = {
        gte: startOfDay(this.parseDate(fecha_inicio)),
        lte: endOfDay(this.parseDate(fecha_fin)),
      };
    }

    const totalVentas = await this.prisma.venta.aggregate({
      _sum: {
        total: true,
      },
      where: whereClause,
    });

    const totalGastos = await this.prisma.gasto.aggregate({
      _sum: {
        total: true,
      },
      where: whereClause,
    });

    const ventas = totalVentas._sum.total?.toNumber() || 0;
    const gastos = totalGastos._sum.total?.toNumber() || 0;
    const balance = ventas - gastos;

    return {
      totalVentas: ventas,
      totalGastos: gastos,
      balance: balance,
    };
  }

  async getSalesOverTime(fecha_inicio?: string, fecha_fin?: string) {
    const endDate = fecha_fin ? endOfDay(this.parseDate(fecha_fin)) : new Date();
    const startDate = fecha_inicio ? startOfDay(this.parseDate(fecha_inicio)) : startOfDay(subDays(endDate, 6));

    const sales: { date: string; total: number }[] = await this.prisma.$queryRaw`
        SELECT DATE(creado_en) as date, SUM(total) as total
        FROM venta
        WHERE creado_en >= ${startDate} AND creado_en <= ${endDate} AND esta_activo = true
        GROUP BY DATE(creado_en)
        ORDER BY DATE(creado_en) ASC;
    `;
    
    const salesMap = new Map(sales.map(s => [format(new Date(s.date), 'yyyy-MM-dd'), Number(s.total)]));

    const result: { name: string; total: number }[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayKey = format(currentDate, 'yyyy-MM-dd');
      result.push({
        name: format(currentDate, 'EEE d', { locale: es }),
        total: salesMap.get(dayKey) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  }

  async getTopSellingProducts(fecha_inicio?: string, fecha_fin?: string) {
    const whereClause: any = {
      producto_id: {
        not: null,
      },
    };
    if (fecha_inicio && fecha_fin) {
      whereClause.venta = {
        creado_en: {
          gte: startOfDay(this.parseDate(fecha_inicio)),
          lte: endOfDay(this.parseDate(fecha_fin)),
        },
      };
    }

    const result = await this.prisma.detalleVenta.groupBy({
      by: ['producto_id'],
      _sum: {
        cantidad: true,
      },
      where: whereClause,
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: 5,
    });

    if (result.length === 0) return [];

    const productIds = result.map(item => item.producto_id as number);

    const products = await this.prisma.producto.findMany({
        where: {
            id: { in: productIds }
        },
        select: {
            id: true,
            nombre: true
        }
    });

    const productMap = new Map(products.map(p => [p.id, p.nombre]));

    return result.map(item => ({
        name: productMap.get(item.producto_id as number) || 'Desconocido',
        value: item._sum.cantidad || 0
    }));
  }

  async getLowStockProducts(): Promise<Producto[]> {
    const products = await this.prisma.$queryRawUnsafe<Producto[]>(
      'SELECT * FROM producto WHERE stock <= stock_minimo AND esta_activo = true ORDER BY stock ASC LIMIT 10'
    );
    return products;
  }

  async getExpiringProducts(): Promise<Producto[]> {
    return this.productosService.obtenerProductosPorVencer();
  }
}
