import api from './api';
import { Categoria, Producto, HistorialProducto } from '@/types';

const URL_PRODUCTOS = '/productos';
const URL_CATEGORIAS = '/categorias';

export const productosService = {
  obtenerTodos: async (): Promise<Producto[]> => {
    const response = await api.get<Producto[]>(URL_PRODUCTOS);
    return response.data;
  },

  crear: async (formData: FormData): Promise<Producto> => {
    const response = await api.post<Producto>(URL_PRODUCTOS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  actualizar: async (id: number, formData: FormData): Promise<Producto> => {
    const response = await api.patch<Producto>(`${URL_PRODUCTOS}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`${URL_PRODUCTOS}/${id}`);
  },

  addStock: async (id: number, cantidad: number): Promise<Producto> => {
    const response = await api.post<Producto>(`${URL_PRODUCTOS}/${id}/add-stock`, { cantidad });
    return response.data;
  },

  getHistory: async (id: number): Promise<HistorialProducto[]> => {
    const response = await api.get<HistorialProducto[]>(`${URL_PRODUCTOS}/history/${id}`);
    return response.data;
  },

  getAllHistory: async (): Promise<HistorialProducto[]> => {
    const response = await api.get<HistorialProducto[]>(`${URL_PRODUCTOS}/history/all`);
    return response.data;
  },

  buscar: async (termino: string): Promise<Producto[]> => {
    const response = await api.get<Producto[]>(`${URL_PRODUCTOS}/buscar/${termino}`);
    return response.data;
  },

  obtenerProductosPorVencer: async (dias?: number): Promise<Producto[]> => {
    const params = dias ? { dias } : {};
    const response = await api.get<Producto[]>(`${URL_PRODUCTOS}/alertas/por-vencer`, { params });
    return response.data;
  },

  obtenerCategorias: async (): Promise<Categoria[]> => {
    const response = await api.get<Categoria[]>(URL_CATEGORIAS);
    return response.data;
  },
};
