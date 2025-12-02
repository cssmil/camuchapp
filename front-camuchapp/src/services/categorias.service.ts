import api from './api';
import { Categoria } from '@/types';

const URL_CATEGORIAS = '/categorias';

export const categoriasService = {
  obtenerTodas: async (): Promise<Categoria[]> => {
    const response = await api.get<Categoria[]>(URL_CATEGORIAS);
    return response.data;
  },

  crear: async (data: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.post<Categoria>(URL_CATEGORIAS, data);
    return response.data;
  },

  actualizar: async (id: number, data: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.patch<Categoria>(`${URL_CATEGORIAS}/${id}`, data);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`${URL_CATEGORIAS}/${id}`);
  },
};
