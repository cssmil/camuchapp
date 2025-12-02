import { Prisma } from '@prisma/client';

export class Venta implements Prisma.VentaUncheckedCreateInput {
  id?: number;
  fecha?: string | Date;
  total: number | Prisma.Decimal;
  cliente_id?: number;
  usuario_id: number;
  esta_activo?: boolean;
  fecha_eliminado?: string | Date;
  eliminado_por?: number;
  creado_en?: string | Date;
  actualizado_en?: string | Date;
  creado_por?: number;
  actualizado_por?: number;
}
