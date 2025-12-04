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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPRouter = void 0;
const classifier_1 = require("./classifier");
const sqlAgent_1 = require("../agents/sqlAgent");
const ragAgent_1 = require("../agents/ragAgent");
const cacheAgent_1 = require("../agents/cacheAgent");
class MCPRouter {
    constructor() {
        this.classifier = new classifier_1.IntentClassifier();
        this.sqlAgent = new sqlAgent_1.SQLAgent();
        this.ragAgent = new ragAgent_1.RAGAgent();
        this.cachedAgent = new cacheAgent_1.CachedAgent();
    }
    route(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const trace = [];
            trace.push(`📥 Mensaje recibido: "${message}"`);
            const intent = yield this.classifier.classify(message);
            trace.push(`🧠 Clasificador: Intención detectada -> ${intent}`);
            let answer;
            let finalAgentUsed = intent;
            switch (intent) {
                case 'SQL':
                    trace.push(`🤖 Agente SQL seleccionado.`);
                    const sqlResult = yield this.sqlAgent.processQuery(message);
                    if (sqlResult.sql) {
                        trace.push(`📝 SQL Generado: "${sqlResult.sql}"`);
                        trace.push(`💾 Ejecutando consulta en base de datos...`);
                        // Lógica de Fallback: Si la data está vacía, cambiamos a RAG
                        if (Array.isArray(sqlResult.data) && sqlResult.data.length === 0) {
                            trace.push(`⚠️ La consulta SQL no devolvió resultados.`);
                            trace.push(`🔄 Cambiando estrategia: Activando Agente RAG para buscar en conocimiento general.`);
                            // Ejecutar RAG
                            const fallbackRagResult = yield this.ragAgent.searchWithTrace(message);
                            // Añadir traza de RAG
                            if (fallbackRagResult.source === 'chroma') {
                                trace.push(`🔎 (Fallback) Buscando en Vector DB (Chroma)...`);
                            }
                            else {
                                trace.push(`🧠 (Fallback) Usando Generación con Gemini.`);
                            }
                            answer = fallbackRagResult.content;
                            finalAgentUsed = 'RAG'; // Actualizamos el agente usado para que el backend sepa cómo procesarlo
                        }
                        else {
                            answer = sqlResult.data;
                        }
                    }
                    else {
                        answer = sqlResult;
                    }
                    break;
                case 'RAG':
                    trace.push(`📚 Agente RAG seleccionado.`);
                    const ragResult = yield this.ragAgent.searchWithTrace(message);
                    if (ragResult.source === 'chroma') {
                        trace.push(`🔎 Buscando en Vector DB (Chroma)...`);
                        trace.push(`✅ Documentos encontrados en ChromaDB.`);
                    }
                    else {
                        trace.push(`⚠️ ChromaDB no disponible o sin resultados.`);
                        trace.push(`🧠 Usando Fallback: Generación con Gemini.`);
                    }
                    answer = ragResult.content;
                    break;
                case 'CACHED':
                    trace.push(`⚡ Agente Cache seleccionado.`);
                    // Mapear mensaje a keys del cache
                    let cacheKey = 'general';
                    if (message.includes('top') || message.includes('vendidos'))
                        cacheKey = 'top_ventas';
                    else if (message.includes('oferta'))
                        cacheKey = 'ofertas';
                    else if (message.includes('horario'))
                        cacheKey = 'horarios';
                    trace.push(`🗝️ Clave de caché: ${cacheKey}`);
                    answer = this.cachedAgent.getCachedResponse(cacheKey);
                    break;
            }
            trace.push(`📤 Enviando respuesta final.`);
            return { answer, agentUsed: finalAgentUsed, trace };
        });
    }
}
exports.MCPRouter = MCPRouter;
