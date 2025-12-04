"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGAgent = void 0;
const chroma_1 = require("../config/chroma");
const chromadb_1 = require("chromadb");
const generative_ai_1 = require("@google/generative-ai");
const gemini_embedding_1 = require("../lib/gemini-embedding");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class RAGAgent {
    constructor() {
        this.collectionName = chroma_1.chromaConfig.collectionName;
        this.chroma = new chromadb_1.ChromaClient({ path: chroma_1.chromaConfig.baseUrl });
        const apiKey = process.env.GEMINI_API_KEY || '';
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        this.embedder = new gemini_embedding_1.GeminiEmbeddingFunction(apiKey);
    }
    /**
     * Versión extendida que devuelve el origen de la respuesta para trazabilidad.
     */
    searchWithTrace(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield this.searchVectorDB(query);
                return { content, source: 'chroma' };
            }
            catch (error) {
                console.log('⚠️ ChromaDB no disponible o error. Usando Fallback a Gemini Generativo.', error);
                const content = yield this.askGenerativeAI(query);
                return { content, source: 'gemini_fallback' };
            }
        });
    }
    /**
     * Mantenemos el método search original para compatibilidad
     */
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.searchWithTrace(query);
            return result.content;
        });
    }
    searchVectorDB(query) {
        return __awaiter(this, void 0, void 0, function* () {
            // Obtener colección
            const collection = yield this.chroma.getCollection({
                name: this.collectionName,
                embeddingFunction: this.embedder
            });
            // Realizar consulta
            const results = yield collection.query({
                queryTexts: [query],
                nResults: 3,
            });
            const documents = results.documents;
            if (!documents || documents.length === 0 || !documents[0] || documents[0].length === 0) {
                throw new Error('Sin resultados en ChromaDB');
            }
            // Castear a string[] porque documents[0] puede ser (string | null)[]
            const validDocs = documents[0].filter((doc) => doc !== null);
            if (validDocs.length === 0) {
                throw new Error('Sin resultados válidos en ChromaDB');
            }
            return validDocs.join('\n\n');
        });
    }
    askGenerativeAI(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
      Eres un asistente farmacéutico experto y amable.
      El usuario tiene una consulta cualitativa (consejo, recomendación, descripción).
      NO tienes acceso a la base de datos de inventario en este momento, así que:
      1. Da una respuesta útil basada en conocimientos generales de farmacia y salud.
      2. Sugiere tipos de productos genéricos que podrían servir (ej: "cremas hidratantes", "multivitamínicos").
      3. NO inventes precios ni stock.
      4. Sé breve y cordial.

      Consulta del usuario: "${query}"
    `;
            try {
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                return response.text();
            }
            catch (err) {
                console.error('Error en Gemini Fallback:', err);
                return "Lo siento, en este momento no puedo acceder a mi base de conocimientos ni procesar tu solicitud.";
            }
        });
    }
}
exports.RAGAgent = RAGAgent;
