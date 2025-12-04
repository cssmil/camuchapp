import { pool } from '../config/db';
import { chromaConfig } from '../config/chroma';
import { ChromaClient } from 'chromadb';
import { GeminiEmbeddingFunction } from '../lib/gemini-embedding';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function syncChroma() {
  console.log('🚀 Iniciando sincronización de productos con ChromaDB (Modo RAW Axios)...');
  
  const client = await pool.connect();
  
  // @ts-ignore
  const chroma = new ChromaClient(chromaConfig.baseUrl);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
      console.error("❌ FALTA GEMINI_API_KEY en .env");
      process.exit(1);
  }
  const embedder = new GeminiEmbeddingFunction(apiKey);

  try {
    // 1. Obtener ID de la colección
    console.log(`📡 Conectando a ChromaDB en: ${chromaConfig.baseUrl}`);
    
    // Asegurar que existe (el cliente usa el nombre, pero el endpoint de crear suele ser /api/v1/collections con body)
    // Intentamos crearla para asegurar existencia
    try {
        // @ts-ignore
        await chroma.createCollection(chromaConfig.collectionName, { "description": "Productos de Tienda de Ropa Camuchapp" });
    } catch (e) {
        // Probablemente ya existe
    }

    // Obtener ID real
    const collections = await chroma.listCollections();
    const myCol = collections.find((c: any) => c.name === chromaConfig.collectionName);
    
    if (!myCol) {
        throw new Error(`No se pudo encontrar la colección ${chromaConfig.collectionName} tras intentar crearla.`);
    }
    const collectionId = myCol.id;
    console.log(`✅ Colección '${chromaConfig.collectionName}' encontrada. ID: ${collectionId}`);

    // 2. Obtener productos de PostgreSQL
    console.log('📥 Leyendo productos de PostgreSQL...');
    const res = await client.query(`
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

    // 3. Enviar a Chroma en lotes
    const BATCH_SIZE = 20;
    for (let i = 0; i < productos.length; i += BATCH_SIZE) {
      const batchProducts = productos.slice(i, i + BATCH_SIZE);
      
      const batchIds = batchProducts.map(p => p.id.toString());
      const batchMetas = batchProducts.map(p => ({
        precio: Number(p.precio),
        stock: p.stock,
        categoria: p.categoria_nombre || 'General'
      }));
      
      const batchDocs = batchProducts.map(p => {
        return `Producto: ${p.nombre}. Categoría: ${p.categoria_nombre}. Descripción: ${p.descripcion || 'Sin descripción'}. Precio: ${p.precio}.`;
      });

      console.log(`🔄 Generando embeddings para lote ${i} - ${i + batchProducts.length}...`);
      const batchEmbeddings = await embedder.generate(batchDocs);

      console.log(`📤 Subiendo lote ${i}...`);
      
      const url = `${chromaConfig.baseUrl}/api/v1/collections/${collectionId}/add`;
      const payload = {
        ids: batchIds,
        embeddings: batchEmbeddings,
        metadatas: batchMetas,
        documents: batchDocs
      };

      try {
        await axios.post(url, payload);
        console.log(`✅ Lote ${i} subido.`);
      } catch (e: any) {
        console.error(`❌ Falló subida de lote ${i}:`, e.message);
        if (e.response) {
            console.error('Detalle:', JSON.stringify(e.response.data));
        }
      }
    }

    console.log('✅ Sincronización completada con éxito.');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

syncChroma();
