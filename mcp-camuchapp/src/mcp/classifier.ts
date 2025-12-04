import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export type AgentType = 'SQL' | 'RAG' | 'CACHED' | 'INVALID';

export class IntentClassifier {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('ADVERTENCIA: GEMINI_API_KEY no está definida en el clasificador.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async classify(message: string): Promise<AgentType> {
    // Paso 1: Optimización para Cache (Reglas simples primero para velocidad)
    // Si es algo extremadamente obvio y estático, no gastamos tokens ni tiempo de LLM.
    const lowerMsg = message.toLowerCase();
    if (
      lowerMsg.includes('horario') || 
      lowerMsg.includes('abierto') || 
      (lowerMsg.includes('oferta') && !lowerMsg.includes('precio')) // "que ofertas hay" vs "precio de oferta"
    ) {
      return 'CACHED';
    }

    // Paso 2: Clasificación Semántica con LLM
    const prompt = `
      Eres el cerebro central de una TIENDA DE ROPA llamada Camuchapp. Tu tarea principal es FILTRAR y CLASIFICAR la intención del usuario.
      
      PRIMERO: Analiza si la pregunta tiene relación con ropa, moda, estilo, compras, la tienda, horarios o atención al cliente.
      - Si la pregunta es sobre política, religión, programación, cocina, o cualquier tema NO relacionado con una tienda de ropa: RESPONDE "INVALID".
      
      SEGUNDO: Si es relevante, clasifica en una de estas 3 categorías:
      
      1. SQL: Consultas sobre DATOS exactos de inventario o ventas.
         - Ejemplos: "¿Cuánto cuestan los jeans?", "stock de camisas", "ventas de ayer", "¿qué talla hay de...?", "precio de...".
      
      2. CACHED: Consultas informativas estáticas predefinidas.
         - Ejemplos: "top 10 más vendidos", "productos populares", "horarios de atención", "ofertas del mes".
      
      3. RAG: Consultas cualitativas, consejos de moda o búsquedas generales.
         - Ejemplos: "¿Qué me recomiendas para una fiesta?", "busco algo para verano", "¿qué tela es mejor?", "consejos de estilo".

      Mensaje del usuario: "${message}"

      Responde SOLAMENTE con una de las palabras: SQL, CACHED, RAG, o INVALID.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toUpperCase().replace('.', '');

      // Validación de seguridad
      if (['SQL', 'RAG', 'CACHED', 'INVALID'].includes(text)) {
        return text as AgentType;
      }
      // Fallback si el modelo alucina
      return 'RAG';
    } catch (error) {
      console.error('Error en clasificador LLM:', error);
      return 'RAG'; // Fallback seguro
    }
  }
}