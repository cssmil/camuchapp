import fs from 'fs';
import path from 'path';

export class CachedAgent {
  private cachePath: string;
  private cacheData: Record<string, string>;

  constructor() {
    this.cachePath = path.join(__dirname, '../data/cache.json');
    this.cacheData = this.loadCache();
  }

  private loadCache(): Record<string, string> {
    try {
      if (fs.existsSync(this.cachePath)) {
        const data = fs.readFileSync(this.cachePath, 'utf-8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Error cargando cache:', error);
      return {};
    }
  }

  /**
   * Obtiene una respuesta predefinida basada en la intención o clave.
   * @param intent La clave a buscar en el cache.
   */
  getCachedResponse(intent: string): string {
    // Recargar cache en cada llamada para desarrollo (opcional, bueno para demos)
    // En producción, esto debería estar en memoria o tener un mecanismo de invalidación.
    this.cacheData = this.loadCache(); 

    // Búsqueda directa o fuzzy simple
    if (this.cacheData[intent]) {
      return this.cacheData[intent];
    }

    // Fallback: buscar si alguna clave está contenida en el intent
    const foundKey = Object.keys(this.cacheData).find(key => intent.includes(key));
    if (foundKey) {
      return this.cacheData[foundKey];
    }

    return "Lo siento, no tengo esa información en mi cache rápido.";
  }
}
