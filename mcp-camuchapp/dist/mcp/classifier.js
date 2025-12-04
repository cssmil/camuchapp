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
exports.IntentClassifier = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class IntentClassifier {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('ADVERTENCIA: GEMINI_API_KEY no está definida en el clasificador.');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
    classify(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Paso 1: Optimización para Cache (Reglas simples primero para velocidad)
            // Si es algo extremadamente obvio y estático, no gastamos tokens ni tiempo de LLM.
            const lowerMsg = message.toLowerCase();
            if (lowerMsg.includes('horario') ||
                lowerMsg.includes('abierto') ||
                (lowerMsg.includes('oferta') && !lowerMsg.includes('precio')) // "que ofertas hay" vs "precio de oferta"
            ) {
                return 'CACHED';
            }
            // Paso 2: Clasificación Semántica con LLM
            const prompt = `
      Eres el cerebro central de una farmacia (Router). Tu única tarea es clasificar la intención del usuario en una de estas 3 categorías.
      
      CATEGORÍAS:
      1. SQL: Consultas sobre DATOS cuantitativos o registros de la base de datos.
         - Ejemplos: Precios, stock, inventario, historial de ventas, "¿cuál fue el primer producto vendido?", "¿quién compró más?", "lista de productos", "ventas de ayer".
      
      2. CACHED: Consultas informativas estáticas predefinidas.
         - Ejemplos: "top 10 más vendidos", "productos populares". (Cosas que no cambian minuto a minuto o son listas famosas).
      
      3. RAG: Consultas cualitativas, consejos médicos, descripciones o dudas generales.
         - Ejemplos: "¿Para qué sirve el paracetamol?", "recomiéndame algo para la tos", "¿qué ingredientes tiene X?".

      Mensaje del usuario: "${message}"

      Responde SOLAMENTE con una de las palabras: SQL, CACHED, o RAG.
    `;
            try {
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text().trim().toUpperCase().replace('.', '');
                // Validación de seguridad
                if (['SQL', 'RAG', 'CACHED'].includes(text)) {
                    return text;
                }
                // Fallback si el modelo alucina
                return 'RAG';
            }
            catch (error) {
                console.error('Error en clasificador LLM:', error);
                return 'RAG'; // Fallback seguro
            }
        });
    }
}
exports.IntentClassifier = IntentClassifier;
