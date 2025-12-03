import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AiPersistenceService {
  constructor(private prisma: PrismaService) {}

  async createConversation(userId: number, title: string) {
    return this.prisma.conversation.create({
      data: {
        userId,
        title,
      },
    });
  }

  async getUserConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
    });
  }

  async getConversation(id: string, userId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation || conversation.userId !== userId) {
      throw new NotFoundException('Conversación no encontrada');
    }

    return conversation;
  }

  async deleteConversation(id: string, userId: number) {
     const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation || conversation.userId !== userId) {
      throw new NotFoundException('Conversación no encontrada o no autorizada');
    }

    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string, sql?: string) {
    // Actualizar timestamp de la conversación
    await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });

    return this.prisma.aiMessage.create({
      data: {
        conversationId,
        role,
        content,
        sql,
      },
    });
  }
}
