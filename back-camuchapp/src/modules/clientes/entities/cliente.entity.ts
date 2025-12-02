import { Prisma } from '@prisma/client';

export class Cliente implements Prisma.ClienteUncheckedCreateInput {
  id?: number;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  esta_activo?: boolean;
  fecha_eliminado?: string | Date;
  eliminado_por?: number;
  creado_en?: string | Date;
  actualizado_en?: string | Date;
  creado_por?: number;
  actualizado_por?: number;
}
