import { IntentClassifier, AgentType } from './classifier';
import { SQLAgent } from '../agents/sqlAgent';
import { RAGAgent } from '../agents/ragAgent';
import { CachedAgent } from '../agents/cacheAgent';

export interface MCPResponse {
  answer: any;
  agentUsed: AgentType;
  trace: string[]; // Lista de pasos realizados
}

export class MCPRouter {
  private classifier: IntentClassifier;
  private sqlAgent: SQLAgent;
  private ragAgent: RAGAgent;
  private cachedAgent: CachedAgent;

  constructor() {
    this.classifier = new IntentClassifier();
    this.sqlAgent = new SQLAgent();
    this.ragAgent = new RAGAgent();
    this.cachedAgent = new CachedAgent();
  }

  async route(message: string): Promise<MCPResponse> {
    const trace: string[] = [];
    trace.push(`📥 Mensaje recibido: "${message}"`);

    const intent = await this.classifier.classify(message);
    trace.push(`🧠 Clasificador: Intención detectada -> ${intent}`);
    
    let answer: any;
    let finalAgentUsed: AgentType = intent;

    switch (intent) {
      case 'INVALID':
        trace.push(`🚫 Tema no permitido detectado.`);
        answer = "Lo siento, soy Camucha 👗, tu asistente de moda. Solo puedo ayudarte con consultas sobre nuestra tienda de ropa, productos y consejos de estilo. No tengo información sobre otros temas.";
        finalAgentUsed = 'CACHED'; // Lo marcamos como cached/static para el frontend
        break;

      case 'SQL':
        trace.push(`🤖 Agente SQL seleccionado.`);
        const sqlResult = await this.sqlAgent.processQuery(message);
        
        if (sqlResult.sql) {
            trace.push(`📝 SQL Generado: "${sqlResult.sql}"`);
            trace.push(`💾 Ejecutando consulta en base de datos...`);
            
            // Lógica de Fallback: Si la data está vacía, cambiamos a RAG
            if (Array.isArray(sqlResult.data) && sqlResult.data.length === 0) {
                trace.push(`⚠️ La consulta SQL no devolvió resultados.`);
                trace.push(`🔄 Cambiando estrategia: Activando Agente RAG para buscar en conocimiento general.`);
                
                // Ejecutar RAG
                const fallbackRagResult = await this.ragAgent.searchWithTrace(message);
                
                // Añadir traza de RAG
                if (fallbackRagResult.source === 'chroma') {
                    trace.push(`🔎 (Fallback) Buscando en Vector DB (Chroma)...`);
                } else {
                    trace.push(`🧠 (Fallback) Usando Generación con Gemini.`);
                }
                
                answer = fallbackRagResult.content;
                finalAgentUsed = 'RAG'; // Actualizamos el agente usado para que el backend sepa cómo procesarlo
            } else {
                answer = sqlResult.data;
            }
        } else {
            answer = sqlResult;
        }
        break;

      case 'RAG':
        trace.push(`📚 Agente RAG seleccionado.`);
        const ragResult = await this.ragAgent.searchWithTrace(message);
        if (ragResult.source === 'chroma') {
            trace.push(`🔎 Buscando en Vector DB (Chroma)...`);
            trace.push(`✅ Documentos encontrados en ChromaDB.`);
        } else {
            trace.push(`⚠️ ChromaDB no disponible o sin resultados.`);
            trace.push(`🧠 Usando Fallback: Generación con Gemini.`);
        }
        answer = ragResult.content;
        break;

      case 'CACHED':
        trace.push(`⚡ Agente Cache seleccionado.`);
        // Mapear mensaje a keys del cache
        let cacheKey = 'general';
        if (message.includes('top') || message.includes('vendidos')) cacheKey = 'top_ventas';
        else if (message.includes('oferta')) cacheKey = 'ofertas';
        else if (message.includes('horario')) cacheKey = 'horarios';
        
        trace.push(`🗝️ Clave de caché: ${cacheKey}`);
        answer = this.cachedAgent.getCachedResponse(cacheKey);
        break;
    }

    trace.push(`📤 Enviando respuesta final.`);
    return { answer, agentUsed: finalAgentUsed, trace };
  }
}
