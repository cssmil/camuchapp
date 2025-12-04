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
const db_1 = require("../config/db");
const chroma_1 = require("../config/chroma");
const chromadb_1 = require("chromadb");
const gemini_embedding_1 = require("../lib/gemini-embedding");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function syncChroma() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Iniciando sincronización de productos con ChromaDB (SDK Oficial + Gemini Embeddings)...');
        const client = yield db_1.pool.connect();
        // Inicializar Cliente Chroma
        const chroma = new chromadb_1.ChromaClient({
            path: chroma_1.chromaConfig.baseUrl,
            tenant: 'default_tenant',
            database: 'default_database'
        });
        // Inicializar Embedder Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ FALTA GEMINI_API_KEY en .env");
            process.exit(1);
        }
        const embedder = new gemini_embedding_1.GeminiEmbeddingFunction(apiKey);
        try {
            // 1. Verificar conexión con ChromaDB
            console.log(`📡 Conectando a ChromaDB en: ${chroma_1.chromaConfig.baseUrl}`);
            const version = yield chroma.version();
            console.log(`✅ Conexión exitosa. Versión Chroma: ${version}`);
            // Obtener o crear colección (Pasando el embedder explícito)
            const collection = yield chroma.getOrCreateCollection({
                name: chroma_1.chromaConfig.collectionName,
                metadata: { "description": "Tienda de ropa Camuchapp" },
                embeddingFunction: embedder
            });
            console.log(`✅ Colección '${chroma_1.chromaConfig.collectionName}' lista.`);
            // 2. Obtener productos de PostgreSQL
            console.log('📥 Leyendo productos de PostgreSQL...');
            const res = yield client.query(`
      SELECT 
        p.id, 
        p.nombre, 
        p.descripcion, 
        p.precio,
        p.stock,
        c.nombre as categoria_nombre
      FROM producto p
      LEFT JOIN categoria c ON p.categoria_id = c.id
      WHERE p.esta_activo = true
    `);
            const productos = res.rows;
            console.log(`📦 Se encontraron ${productos.length} productos activos.`);
            if (productos.length === 0) {
                console.log('⏹️ No hay productos para sincronizar.');
                return;
            }
            // 3. Preparar datos para Chroma
            // Chroma necesita: ids, documents (texto para embedding), metadatas
            const ids = productos.map(p => p.id.toString());
            const metadatas = productos.map(p => ({
                precio: Number(p.precio),
                stock: p.stock,
                categoria: p.categoria_nombre || 'General'
            }));
            const documents = productos.map(p => {
                return `Producto: ${p.nombre}. Categoría: ${p.categoria_nombre}. Descripción: ${p.descripcion || 'Sin descripción'}. Precio: ${p.precio}.`;
            });
            // 4. Enviar a Chroma en lotes
            const BATCH_SIZE = 20;
            for (let i = 0; i < productos.length; i += BATCH_SIZE) {
                const batchIds = ids.slice(i, i + BATCH_SIZE);
                const batchDocs = documents.slice(i, i + BATCH_SIZE);
                const batchMetas = metadatas.slice(i, i + BATCH_SIZE);
                console.log(`uploading batch ${i} - ${i + BATCH_SIZE}...`);
                yield collection.add({
                    ids: batchIds,
                    documents: batchDocs,
                    metadatas: batchMetas,
                });
            }
            console.log('✅ Sincronización completada con éxito.');
        }
        catch (error) {
            console.error('❌ Error durante la sincronización:', error);
        }
        finally {
            client.release();
            yield db_1.pool.end();
        }
    });
}
syncChroma();
