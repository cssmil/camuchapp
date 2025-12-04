import api from './api';

export interface AiResponse {
  question: string;
  generatedSql: string;
  data: any[];
  answer: string;
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
    const response = await api.post<Conversation>('/ai/conversations', { title });
    return response.data;
  },

  // Listar historial de conversaciones
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/ai/conversations');
    return response.data;
  },

  // Obtener detalle de una conversación
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await api.get<Conversation>(`/ai/conversations/${id}`);
    return response.data;
  },

  // Eliminar conversación
  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/ai/conversations/${id}`);
  },

  // Enviar mensaje (Chat con memoria)
  sendMessage: async (conversationId: string, message: string): Promise<AiResponse> => {
    const response = await api.post<AiResponse>(`/ai/chat/${conversationId}`, { message });
    return response.data;
  },
};