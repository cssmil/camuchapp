import api from './api';

export interface AiResponse {
  answer: string;
  sql?: string;
  sources?: string[];
  products?: any[];
  messageId?: string;
  trace?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  trace?: string[];
  createdAt: string;
}

export const aiService = {
  // Crear nueva conversación
  createConversation: async (title?: string): Promise<Conversation> => {
    // Endpoint restaurado
    const response = await api.post<Conversation>('/chat/conversations', { title });
    return response.data;
  },

  // Listar historial de conversaciones
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/chat/conversations');
    return response.data;
  },

  // Obtener detalle de una conversación
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await api.get<Conversation>(`/chat/conversations/${id}`);
    return response.data;
  },

  // Eliminar conversación
  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/chat/conversations/${id}`);
  },

  // Enviar mensaje (Chat con memoria)
  // Nota: El backend ahora manejará la persistencia interna
  sendMessage: async (conversationId: string, message: string): Promise<AiResponse> => {
    const response = await api.post<AiResponse>(`/chat/conversations/${conversationId}/messages`, { message });
    return response.data;
  },
};