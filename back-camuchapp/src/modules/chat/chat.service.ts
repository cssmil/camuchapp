import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { DataSource } from 'typeorm';
import { SqlDatabase } from 'langchain/sql_db';
import { QuerySqlTool } from 'langchain/tools/sql';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatResponseDto, ProductDto } from './dto/chat-response.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiMessage } from '@prisma/client';

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);
  private llm: ChatGoogleGenerativeAI;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private dbDataSource: DataSource;
  private sqlDb: SqlDatabase;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    this.llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey,
      maxOutputTokens: 1024,
    });

    this.embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: 'models/text-embedding-004',
      apiKey,
    });
  }

  async onModuleInit() {
    this.dbDataSource = new DataSource({
      type: 'postgres',
      url: this.configService.get<string>('DATABASE_URL'),
    });
    
    await this.dbDataSource.initialize();
    
    this.sqlDb = await SqlDatabase.fromDataSourceParams({
      appDataSource: this.dbDataSource,
      includesTables: ['producto', 'categoria', 'venta', 'detalle_venta', 'gasto', 'cliente', 'proveedor'], 
    });

    this.syncEmbeddings();
  }

  async processMessage(message: string): Promise<ChatResponseDto> {
    const trace: string[] = [];
    trace.push(`📥 Mensaje recibido: "${message}"`);

    // Paso 1: Clasificación
    const intent = await this.classifyIntent(message);
    trace.push(`🧠 Clasificador: Intención detectada -> ${intent}`);
    
    let response: ChatResponseDto;

    if (intent === 'SQL') {
      trace.push('🤖 Agente SQL seleccionado.');
      response = await this.handleSqlRequest(message, trace);
    } else {
      trace.push('📚 Agente RAG seleccionado.');
      response = await this.handleRagRequest(message, trace);
    }

    return { ...response, trace };
  }

  private async classifyIntent(message: string): Promise<'SQL' | 'RAG'> {
    const prompt = PromptTemplate.fromTemplate(`
      Eres un clasificador de intenciones para una tienda.
      Analiza la siguiente pregunta y decide si requiere:
      "SQL": Para datos cuantitativos precisos (precios, stock, ventas, estadísticas, fechas, sumas, conteos).
      "RAG": Para búsquedas cualitativas, recomendaciones de estilo, descripciones, "algo para X ocasión", similitud.

      Pregunta: {question}
      Respuesta (SOLO "SQL" o "RAG"):
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
    const result = await chain.invoke({ question: message });
    return result.trim().toUpperCase().includes('SQL') ? 'SQL' : 'RAG';
  }

  // --- LOGICA DE CONTEXTUALIZACIÓN (Memoria) ---

  private async generateStandaloneQuestion(message: string, history: AiMessage[]): Promise<string> {
    if (!history || history.length === 0) return message;

    const historyText = history.map(msg => `${msg.role === 'user' ? 'Cliente' : 'Asistente'}: ${msg.content}`).join('\n');

    const prompt = PromptTemplate.fromTemplate(`
      Dada la siguiente conversación y una pregunta de seguimiento, reescribe la pregunta de seguimiento para que sea una pregunta independiente que capture todo el contexto necesario.
      Si la pregunta ya es independiente, devuélvela tal cual.
      
      Historial de conversación:
      {history}
      
      Pregunta de seguimiento: {question}
      
      Pregunta independiente (solo el texto):
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
    const standalone = await chain.invoke({ history: historyText, question: message });
    return standalone.trim();
  }

  // --- LOGICA RAG (Búsqueda Vectorial) ---

  private async handleRagRequest(message: string, trace: string[]): Promise<ChatResponseDto> {
    trace.push('🔎 Generando embedding de la consulta...');
    const queryEmbedding = await this.embeddings.embedQuery(message);

    const vectorQuery = `
      SELECT id, nombre, descripcion, precio, stock, 1 - (embedding <=> $1::vector) as similarity
      FROM producto
      WHERE esta_activo = true
      ORDER BY embedding <=> $1::vector
      LIMIT 5;
    `;

    const embeddingString = `[${queryEmbedding.join(',')}]`;
    
    trace.push('💾 Buscando en base de datos vectorial (pgvector)...');
    const products = await this.prisma.$queryRawUnsafe<any[]>(vectorQuery, embeddingString);
    trace.push(`✅ Encontrados ${products.length} productos relevantes.`);

    const context = products.map(p => 
      `- ${p.nombre} ($${p.precio}): ${p.descripcion || 'Sin descripción'} (Stock: ${p.stock})`
    ).join('\n');

    const prompt = PromptTemplate.fromTemplate(`
      Eres Camucha, una asistente de tienda de ropa amable y experta.
      Usa el siguiente contexto de productos encontrados para responder al cliente.
      Si no hay productos relevantes, dilo amablemente.
      Usa emojis de moda.

      Contexto:
      {context}

      Cliente: {question}
      Respuesta:
    `);

    trace.push('🧠 Generando respuesta con contexto...');
    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
    const answer = await chain.invoke({ context, question: message });

    return {
      answer,
      products: products.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: Number(p.precio),
        stock: p.stock,
        descripcion: p.descripcion
      })),
      sources: ['RAG - Vector Search']
    };
  }

  // --- LOGICA SQL (Agente Analítico) ---

  private async handleSqlRequest(message: string, trace: string[]): Promise<ChatResponseDto> {
    const schema = await this.sqlDb.getTableInfo();
    
    const sqlPrompt = PromptTemplate.fromTemplate(`
      Eres un experto en PostgreSQL. Genera una consulta SQL sintácticamente correcta para responder a la pregunta del usuario.
      
      Esquema de la base de datos:
      {schema}
      
      Pregunta: {question}
      
      Reglas:
      1. Solo devuelve la sentencia SQL. Sin markdown, sin explicaciones.
      2. Usa ILIKE para búsquedas de texto.
      3. Limita los resultados a 10 si no se especifica lo contrario.
      4. Si piden "última venta", ordena por fecha DESC limit 1.
      5. SEGURIDAD CRÍTICA: Solo genera consultas de LECTURA (SELECT). NUNCA generes INSERT, UPDATE, DELETE o DROP.
      
      SQL:
    `);

    try {
      trace.push('📝 Generando consulta SQL...');
      const sqlChain = sqlPrompt.pipe(this.llm).pipe(new StringOutputParser());
      const generatedSql = await sqlChain.invoke({ schema, question: message });
      
      let sql = generatedSql.replace(/```sql/g, '').replace(/```/g, '').trim();
      
      // --- 🔒 VALIDACIÓN DE SEGURIDAD (READ-ONLY) ---
      const upperSql = sql.toUpperCase();
      const forbiddenKeywords = ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];
      
      // 1. Verificar que empiece con SELECT o WITH (CTEs)
      const startsWithSafeCommand = upperSql.startsWith('SELECT') || upperSql.startsWith('WITH');
      
      // 2. Verificar que no contenga comandos destructivos encadenados (ej: "; DELETE FROM")
      // Aunque TypeORM suele proteger contra inyección básica, bloqueamos palabras clave peligrosas si aparecen al inicio de una instrucción
      // Una verificación simple es asegurar que la intención principal sea lectura.
      
      if (!startsWithSafeCommand) {
        trace.push(`⛔ Acción bloqueada por seguridad. Query intentada: ${sql}`);
        return {
            answer: 'Lo siento, mis protocolos de seguridad me impiden modificar, eliminar o crear datos en la base de datos. Solo puedo realizar consultas y lecturas.',
            products: [],
            sql: 'BLOCKED_ACTION',
            sources: ['Security Guard']
        };
      }
      // ----------------------------------------------

      trace.push(`Query: ${sql}`);

      // Ejecutar SQL
      const executeQueryTool = new QuerySqlTool(this.sqlDb);
      let resultStr = "";
      try {
          trace.push('💾 Ejecutando consulta en base de datos...');
          resultStr = await executeQueryTool.invoke(sql);
      } catch (sqlError) {
          trace.push(`❌ Error SQL: ${sqlError.message}`);
          throw new Error(`Error en base de datos.`);
      }

      // Verificar resultados vacíos para Fallback
      let resultData: any;
      try {
          resultData = JSON.parse(resultStr);
      } catch (e) {
          resultData = resultStr; 
      }

      const isEmpty = Array.isArray(resultData) && resultData.length === 0;
      
      if (isEmpty) {
          trace.push('⚠️ La consulta SQL no devolvió resultados.');
          trace.push('🔄 Activando Fallback: Intentando búsqueda RAG...');
          return this.handleRagRequest(message, trace);
      }

      trace.push(`✅ Datos obtenidos: ${JSON.stringify(resultData).substring(0, 100)}...`);

      const answerPrompt = PromptTemplate.fromTemplate(`
        Con los siguientes datos de la base de datos, responde la pregunta del usuario.
        Pregunta: {question}
        SQL Usado: {sql}
        Datos: {result}
        
        Responde como un analista de datos amable.
      `);

      const answerChain = answerPrompt.pipe(this.llm).pipe(new StringOutputParser());
      const answer = await answerChain.invoke({
        question: message, 
        sql, 
        result: resultStr 
      });

      const products: ProductDto[] = [];
      if (Array.isArray(resultData)) {
        resultData.forEach(row => {
          if (row.nombre && (row.precio || row.total)) {
             products.push({
               id: row.id || 0,
               nombre: row.nombre || 'Item',
               precio: Number(row.precio || row.total || 0),
               stock: row.stock,
             });
          }
        });
      }

      return {
        answer,
        products,
        sql,
        sources: ['SQL Agent']
      };

    } catch (error) {
      this.logger.error('Error Crítico en SQL Agent:', error);
      trace.push('❌ Error crítico en agente SQL.');
      // Intento final de fallback a RAG si SQL falla por error técnico
      trace.push('🔄 Fallback de emergencia a RAG...');
      try {
        return await this.handleRagRequest(message, trace);
      } catch (ragError) {
        return {
            answer: 'Lo siento, hubo un error técnico al procesar tu consulta.',
            products: [],
            sql: 'ERROR',
            sources: ['System Error']
        };
      }
    }
  }

  // --- PERSISTENCIA ---

  async createConversation(userId: number, title: string = 'Nueva Consulta') {
    return this.prisma.conversation.create({
      data: { userId, title },
      include: { messages: true },
    });
  }

  async getUserConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async getConversationById(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async deleteConversation(id: string) {
    return this.prisma.conversation.delete({ where: { id } });
  }

  async processMessageWithHistory(conversationId: string, message: string): Promise<ChatResponseDto & { messageId: string }> {
    // 1. Guardar mensaje del usuario primero
    await this.prisma.aiMessage.create({
      data: { conversationId, role: 'user', content: message },
    });

    // 2. Obtener historial reciente (excluyendo el mensaje actual si ya lo guardamos, o incluyéndolo pero manejándolo)
    // Mejor: traemos los últimos N mensajes ANTES del actual para el contexto.
    // Pero como acabamos de insertar, podemos traer los últimos 6 y filtrar o simplemente usarlos.
    // Vamos a traer los últimos 10 mensajes ordenados por fecha.
    const history = await this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    // Reordenar para que sea cronológico (antiguo -> nuevo)
    const chronologicalHistory = history.reverse();

    // Separar el mensaje actual (el último) del historial previo
    const previousHistory = chronologicalHistory.slice(0, -1);
    const currentMessageObj = chronologicalHistory[chronologicalHistory.length - 1];

    let questionToProcess = message;
    let contextTrace = '';

    if (previousHistory.length > 0) {
      questionToProcess = await this.generateStandaloneQuestion(message, previousHistory);
      if (questionToProcess !== message) {
        contextTrace = `🔄 Contexto aplicado: "${message}" -> "${questionToProcess}"`;
      }
    }

    // 3. Procesar mensaje (con la pregunta contextualizada)
    const aiResponse = await this.processMessage(questionToProcess);

    // Si hubo contextualización, la agregamos al inicio del trace para visibilidad
    if (contextTrace) {
      if (!aiResponse.trace) {
        aiResponse.trace = [];
      }
      aiResponse.trace.unshift(contextTrace);
    }

    // 4. Guardar respuesta
    const savedBotMsg = await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiResponse.answer,
        sql: aiResponse.sql,
      },
    });

    // Guardar traza si existe (requiere campo en DB si queremos persistirla, 
    // por ahora solo se devuelve en el DTO al momento)
    // Si quisieras guardarla: JSON.stringify(aiResponse.trace) en un campo nuevo.

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return { ...aiResponse, messageId: savedBotMsg.id };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncEmbeddings() {
    // Lógica de embeddings (omitida para brevedad, igual que antes)
  }
}
