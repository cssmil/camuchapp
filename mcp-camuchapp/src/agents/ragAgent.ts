import { chromaConfig } from '../config/chroma';
import { ChromaClient } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiEmbeddingFunction } from '../lib/gemini-embedding';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export class RAGAgent {
  private chroma: ChromaClient;
  private collectionName: string;
  private genAI: GoogleGenerativeAI;
  private model: any;
  private embedder: GeminiEmbeddingFunction;
  private collectionId: string | null = null;

  constructor() {
    this.collectionName = chromaConfig.collectionName;
    // @ts-ignore
    this.chroma = new ChromaClient(chromaConfig.baseUrl);
    
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    this.embedder = new GeminiEmbeddingFunction(apiKey);
  }

  private async getCollectionId(): Promise<string> {
    if (this.collectionId) return this.collectionId;

    try {
        const collections = await this.chroma.listCollections();
        const myCol = collections.find((c: any) => c.name === this.collectionName);
        if (myCol) {
            this.collectionId = myCol.id;
            return myCol.id;
        }
    } catch (e) {
        console.error("Error listing collections:", e);
    }
    throw new Error(`Collection ${this.collectionName} not found`);
  }


  async searchWithTrace(query: string): Promise<{ content: string, source: 'chroma' | 'gemini_fallback' }> {
    try {
      const documents = await this.searchVectorDB(query);
      // Sintetizar una respuesta natural usando el contexto encontrado
      const synthesizedAnswer = await this.synthesizeAnswer(query, documents);
      return { content: synthesizedAnswer, source: 'chroma' };
    } catch (error) {
      console.log('⚠️ ChromaDB no disponible o error. Usando Fallback a Gemini Generativo.', error);
      const content = await this.askGenerativeAI(query);
      return { content, source: 'gemini_fallback' };
    }
  }

  async search(query: string): Promise<string> {
    const result = await this.searchWithTrace(query);
    return result.content;
  }

  private async searchVectorDB(query: string): Promise<string> {
    // 1. Obtener ID
    const colId = await this.getCollectionId();

    // 2. Generar embeddings
    const embeddings = await this.embedder.generate([query]);

    // 3. Query RAW con Axios
    const url = `${chromaConfig.baseUrl}/api/v1/collections/${colId}/query`;
    const payload = {
        query_embeddings: embeddings,
        n_results: 5,
    };

    const response = await axios.post(url, payload);
    const results = response.data;

    // 4. Parsear resultados
    const documents = results.documents;

    if (!documents || documents.length === 0 || !documents[0] || documents[0].length === 0) {
      throw new Error('Sin resultados en ChromaDB');
    }

    const validDocs = documents[0].filter((doc: any) => doc !== null);
    
    if (validDocs.length === 0) {
        throw new Error('Sin resultados válidos en ChromaDB');
    }

    return validDocs.join('\n\n');
  }

  /**
   * Toma los documentos crudos (contexto) y usa LLM para generar una respuesta amigable
   */
  private async synthesizeAnswer(query: string, context: string): Promise<string> {
    const prompt = `
      Eres un asistente de tienda de ropa llamado "Camucha". Tu objetivo es ayudar a los clientes a encontrar prendas y accesorios en nuestro inventario.
      
      Contexto (Productos encontrados en base de datos):
      ${context}

      Pregunta del Usuario: "${query}"

      Instrucciones:
      1. Usa SOLO la información del contexto proporcionado.
      2. Si encontraste productos relevantes, recomiéndalos amablemente, mencionando su nombre, categoría y precio.
      3. Si los productos en el contexto NO parecen relevantes para la pregunta (por ejemplo, preguntó por "hombres" y solo hay ropa de mujer), indícalo claramente: "Encontré estos productos, pero no estoy seguro si son lo que buscas...".
      4. Sé breve, cordial y usa emojis de moda 👗 👕 🛍️.
      5. NO inventes información que no esté en el contexto.

      Respuesta:
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error sintetizando respuesta RAG:", error);
      return `Encontré esta información en nuestro catálogo:\n\n${context}`;
    }
  }

  private async askGenerativeAI(query: string): Promise<string> {
    const prompt = `
      Eres un asistente experto en moda y ropa.
      El usuario tiene una consulta cualitativa (consejo, recomendación, descripción).
      NO tienes acceso a la base de datos de inventario en este momento, así que:
      1. Da una respuesta útil basada en conocimientos generales de moda y estilo.
      2. Sugiere tipos de prendas básicas que podrían servir (ej: "jeans", "blusas", "chaquetas").
      3. NO inventes precios ni stock.
      4. Sé breve y cordial.

      Consulta del usuario: "${query}"
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error('Error en Gemini Fallback:', err);
      return "Lo siento, en este momento no puedo acceder a mi base de conocimientos ni procesar tu solicitud.";
    }
  }
}
