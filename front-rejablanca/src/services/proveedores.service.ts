import api from './api';
import { Proveedor } from '@/types';

const URL = '/proveedores'; // Asumiendo que este endpoint existe o se creará

export const proveedoresService = {
  obtenerTodos: async (): Promise<Proveedor[]> => {
    const { data } = await api.get<Proveedor[]>(URL);
    return data;
  },
};
