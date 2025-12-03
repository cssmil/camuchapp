import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete } from '@nestjs/common';
import { SqlGeneratorService } from './services/sql-generator.service';
import { SqlGuardService } from './services/sql-guard.service';
import { SqlExecutorService } from './services/sql-executor.service';
import { SqlInterpreterService } from './services/sql-interpreter.service';
import { AiPersistenceService } from './services/ai-persistence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiAgentController {
  constructor(
    private sqlGenerator: SqlGeneratorService,
    private sqlGuard: SqlGuardService,
    private sqlExecutor: SqlExecutorService,
    private sqlInterpreter: SqlInterpreterService,
    private aiPersistence: AiPersistenceService,
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
    
    // 1. Validar y obtener historial
    const conversation = await this.aiPersistence.getConversation(id, userId);
    const history = conversation.messages; // Mensajes previos para contexto

    // 2. Guardar mensaje del usuario
    await this.aiPersistence.addMessage(id, 'user', message);

    // 3. Generar SQL con contexto
    const sql = await this.sqlGenerator.generateSql(message, history);
    
    // 4. Validar Seguridad
    this.sqlGuard.validate(sql);

    // 5. Ejecutar SQL
    const data = await this.sqlExecutor.execute(sql);

    // 6. Interpretar Resultados
    const answer = await this.sqlInterpreter.interpret(message, data);

    // 7. Guardar respuesta del asistente
    const assistantMessage = await this.aiPersistence.addMessage(id, 'assistant', answer, sql);

    return {
      question: message,
      generatedSql: sql,
      data,
      answer,
      messageId: assistantMessage.id
    };
  }
}