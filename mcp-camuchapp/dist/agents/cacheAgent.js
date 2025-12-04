"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedAgent = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CachedAgent {
    constructor() {
        this.cachePath = path_1.default.join(__dirname, '../data/cache.json');
        this.cacheData = this.loadCache();
    }
    loadCache() {
        try {
            if (fs_1.default.existsSync(this.cachePath)) {
                const data = fs_1.default.readFileSync(this.cachePath, 'utf-8');
                return JSON.parse(data);
            }
            return {};
        }
        catch (error) {
            console.error('Error cargando cache:', error);
            return {};
        }
    }
    /**
     * Obtiene una respuesta predefinida basada en la intención o clave.
     * @param intent La clave a buscar en el cache.
     */
    getCachedResponse(intent) {
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
exports.CachedAgent = CachedAgent;
