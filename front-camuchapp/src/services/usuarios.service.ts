import api from './api';
import { Usuario, CrearUsuarioDto, ActualizarUsuarioDto } from '@/types';

const ENDPOINT = '/usuarios';

export const obtenerTodosLosUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get(ENDPOINT);
  return response.data;
};

export const crearUsuario = async (userData: CrearUsuarioDto): Promise<Usuario> => {
  const response = await api.post(ENDPOINT, userData);
  return response.data;
};

export const actualizarUsuario = async (id: number, userData: ActualizarUsuarioDto): Promise<Usuario> => {
  const response = await api.patch(`${ENDPOINT}/${id}`, userData);
  return response.data;
};

export const eliminarUsuario = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};
