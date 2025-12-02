import api from './api';
import { LoginCredentials, LoginResponse } from '../types';

/**
 * Llama al endpoint de login del backend.
 * @param credentials - Email y contraseña del usuario.
 * @returns La promesa con la respuesta del login (incluyendo el token).
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    // El interceptor de axios podría manejar esto de forma global,
    // pero por ahora, relanzamos el error para que el componente lo maneje.
    throw error;
  }
};
