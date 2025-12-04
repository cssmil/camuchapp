import api from './api';
import { Proveedor } from '@/types';

const URL = '/proveedores'; // Asumiendo que este endpoint existe o se creará

export const proveedoresService = {
  obtenerTodos: async (): Promise<Proveedor[]> => {
    const { data } = await api.get<Proveedor[]>(URL);
    return data;
  },

  crear: async (data: Partial<Proveedor>): Promise<Proveedor> => {
    const { data: nuevoProveedor } = await api.post<Proveedor>(URL, data);
    return nuevoProveedor;
  },

  actualizar: async (id: number, data: Partial<Proveedor>): Promise<Proveedor> => {
    const { data: proveedorActualizado } = await api.patch<Proveedor>(`${URL}/${id}`, data);
    return proveedorActualizado;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`${URL}/${id}`);
  },
};
