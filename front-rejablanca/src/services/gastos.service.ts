import api from './api';
import { Gasto } from '@/types';

const URL = '/gastos';

interface ItemGastoDto {
  descripcion: string;
  costo: number;
}

interface CrearGastoDto {
  proveedorId?: number;
  items: ItemGastoDto[];
}

export const gastosService = {
  crear: async (gastoData: CrearGastoDto): Promise<Gasto> => {
    const { data } = await api.post<Gasto>(URL, gastoData);
    return data;
  },
  obtenerTodos: async (fecha_inicio?: string, fecha_fin?: string): Promise<Gasto[]> => {
    const { data } = await api.get<Gasto[]>(URL, { params: { fecha_inicio, fecha_fin } });
    return data;
  },
  anular: async (id: number): Promise<Gasto> => {
    const { data } = await api.patch<Gasto>(`${URL}/${id}/anular`);
    return data;
  }
};
