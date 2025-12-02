import api from './api';
import { Venta } from '@/types';

const URL = '/ventas';

interface ItemVentaDto {
  productoId?: number;
  cantidad: number;
  precioUnitario?: number;
  descripcionLibre?: string;
}

interface CrearVentaDto {
  clienteId?: number;
  items: ItemVentaDto[];
}

export const ventasService = {
  crear: async (ventaData: CrearVentaDto): Promise<Venta> => {
    const { data } = await api.post<Venta>(URL, ventaData);
    return data;
  },
  obtenerTodos: async (fecha_inicio?: string, fecha_fin?: string): Promise<Venta[]> => {
    const { data } = await api.get<Venta[]>(URL, { params: { fecha_inicio, fecha_fin } });
    return data;
  },
  anular: async (id: number): Promise<Venta> => {
    const { data } = await api.patch<Venta>(`${URL}/${id}/anular`);
    return data;
  },
};
