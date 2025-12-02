import api from './api';
import { Cliente } from '@/types';

const URL = '/clientes';

export const clientesService = {
  obtenerTodos: async (): Promise<Cliente[]> => {
    const { data } = await api.get<Cliente[]>(URL);
    return data;
  },
};
