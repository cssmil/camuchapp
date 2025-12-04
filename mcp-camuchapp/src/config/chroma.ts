import dotenv from 'dotenv';

dotenv.config();

export const chromaConfig = {
  baseUrl: process.env.CHROMA_URL || 'http://localhost:8000',
  collectionName: process.env.CHROMA_COLLECTION || 'camuchapp_products',
};
