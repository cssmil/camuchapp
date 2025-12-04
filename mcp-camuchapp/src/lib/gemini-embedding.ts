import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiEmbeddingFunction {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
  }

  public async generate(texts: string[]): Promise<number[][]> {
    // Gemini espera requests individuales o batch, manejamos la promesa
    const embeddings = await Promise.all(
      texts.map(async (text) => {
        // Limpiamos saltos de línea que a veces afectan embeddings
        const cleanText = text.replace(/\n/g, " ");
        const result = await this.model.embedContent(cleanText);
        return result.embedding.values;
      })
    );
    return embeddings;
  }
}