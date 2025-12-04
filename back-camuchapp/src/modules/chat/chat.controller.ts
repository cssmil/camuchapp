import { Body, Controller, Post, Get, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('Chat AI')
@Controller('chat')
@UseGuards(ThrottlerGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // --- Chat con Historial ---

  @Post('conversations')
  @ApiOperation({ summary: 'Crear nueva conversación' })
  async createConversation(@Body('title') title?: string) {
    // En una implementación real, tomaríamos el userId del JWT
    // Aquí usamos un ID fijo 1 por simplicidad para demostración
    const userId = 1; 
    return this.chatService.createConversation(userId, title);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversaciones del usuario' })
  async getConversations() {
    const userId = 1; 
    return this.chatService.getUserConversations(userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obtener detalle de una conversación' })
  async getConversation(@Param('id') id: string) {
    return this.chatService.getConversationById(id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Eliminar una conversación' })
  async deleteConversation(@Param('id') id: string) {
    return this.chatService.deleteConversation(id);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Enviar mensaje a una conversación existente' })
  async sendMessageToConversation(
    @Param('id') conversationId: string,
    @Body() createChatDto: CreateChatDto
  ) {
    return this.chatService.processMessageWithHistory(conversationId, createChatDto.message);
  }

  // --- Endpoint Legacy (Stateless) ---
  
  @Post()
  @ApiOperation({ summary: 'Enviar mensaje al asistente AI (Stateless)' })
  @ApiResponse({ status: 201, type: ChatResponseDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async chat(@Body() createChatDto: CreateChatDto): Promise<ChatResponseDto> {
    return this.chatService.processMessage(createChatDto.message);
  }
}
