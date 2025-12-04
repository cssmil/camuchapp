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
exports.GeminiEmbeddingFunction = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiEmbeddingFunction {
    constructor(apiKey) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
    }
    generate(texts) {
        return __awaiter(this, void 0, void 0, function* () {
            // Gemini espera requests individuales o batch, manejamos la promesa
            const embeddings = yield Promise.all(texts.map((text) => __awaiter(this, void 0, void 0, function* () {
                // Limpiamos saltos de línea que a veces afectan embeddings
                const cleanText = text.replace(/\n/g, " ");
                const result = yield this.model.embedContent(cleanText);
                return result.embedding.values;
            })));
            return embeddings;
        });
    }
}
exports.GeminiEmbeddingFunction = GeminiEmbeddingFunction;
