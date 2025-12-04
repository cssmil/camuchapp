import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete } from '@nestjs/common';
import { SqlInterpreterService } from './services/sql-interpreter.service';
import { AiPersistenceService } from './services/ai-persistence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiAgentController {
  constructor(
    private sqlInterpreter: SqlInterpreterService,
    private aiPersistence: AiPersistenceService,
    private readonly httpService: HttpService,
  ) {}

  // Crear una nueva conversación
  @Post('conversations')
  async createConversation(@Request() req, @Body('title') title: string) {
    return this.aiPersistence.createConversation(req.user.id, title || 'Nueva Conversación');
  }

  // Listar conversaciones del usuario
  @Get('conversations')
  async getUserConversations(@Request() req) {
    return this.aiPersistence.getUserConversations(req.user.id);
  }

  // Obtener detalle de una conversación (historial)
  @Get('conversations/:id')
  async getConversation(@Request() req, @Param('id') id: string) {
    return this.aiPersistence.getConversation(id, req.user.id);
  }

  // Eliminar conversación
  @Delete('conversations/:id')
  async deleteConversation(@Request() req, @Param('id') id: string) {
      return this.aiPersistence.deleteConversation(id, req.user.id);
  }

  // Enviar mensaje a una conversación existente (reemplaza al antiguo /query)
  @Post('chat/:id')
  async chat(@Request() req, @Param('id') id: string, @Body('message') message: string) {
    const userId = req.user.id;
    
    // 2. Guardar mensaje del usuario
    await this.aiPersistence.addMessage(id, 'user', message);

    // 3. Llamar al Servidor MCP
    let data: any;
    let generatedSql = '';
    let answer = '';
    let agentUsed = '';
    let trace: string[] = [];

    try {
      const mcpResponse = await firstValueFrom(
        this.httpService.post('http://localhost:3002/mcp/query', { message })
      );
      
      const result = mcpResponse.data;
      data = result.answer;
      agentUsed = result.agentUsed;
      trace = result.trace || [];

    } catch (error) {
      console.error('Error comunicando con MCP:', error.message);
      answer = 'Lo siento, tuve problemas conectando con mi cerebro central (MCP).';
      trace.push('❌ Error crítico de conexión con el núcleo MCP.');
    }

    // 4. Procesar respuesta según el agente usado
    if (agentUsed === 'SQL') {
      // Extraer SQL del trace si es posible para guardarlo en el campo legacy generatedSql
      const sqlTrace = trace.find(t => t.includes('SQL Generado:'));
      if (sqlTrace) {
          generatedSql = sqlTrace.replace('📝 SQL Generado: ', '').replace(/`/g, '');
      }

      answer = await this.sqlInterpreter.interpret(message, data);
    } else if (agentUsed === 'CACHED' || agentUsed === 'RAG') {
      answer = typeof data === 'string' ? data : JSON.stringify(data);
    } else if (!answer) {
      answer = 'No pude procesar tu solicitud.';
    }

    // NOTA IMPORTANTE: Ya NO adjuntamos la traza al texto de la respuesta.
    // La enviamos en el campo 'trace' del objeto JSON para que el Frontend la maneje.

    // 6. Guardar respuesta del asistente
    const assistantMessage = await this.aiPersistence.addMessage(id, 'assistant', answer, generatedSql);

    return {
      question: message,
      generatedSql,
      data,
      answer,
      messageId: assistantMessage.id,
      trace: trace // Nuevo campo para el Frontend
    };
  }
}