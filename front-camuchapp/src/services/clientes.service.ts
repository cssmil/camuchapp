import api from './api';
import { Cliente } from '@/types';

const URL = '/clientes';

export const clientesService = {
  obtenerTodos: async (): Promise<Cliente[]> => {
    const { data } = await api.get<Cliente[]>(URL);
    return data;
  },

  crear: async (data: Partial<Cliente>): Promise<Cliente> => {
    const { data: nuevoCliente } = await api.post<Cliente>(URL, data);
    return nuevoCliente;
  },

  actualizar: async (id: number, data: Partial<Cliente>): Promise<Cliente> => {
    const { data: clienteActualizado } = await api.patch<Cliente>(`${URL}/${id}`, data);
    return clienteActualizado;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`${URL}/${id}`);
  },
};
