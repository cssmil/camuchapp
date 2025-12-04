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
exports.SQLAgent = void 0;
const db_1 = require("../config/db");
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class SQLAgent {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('ADVERTENCIA: GEMINI_API_KEY no está definida en el archivo .env del MCP');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
    /**
     * Proceso principal: Genera SQL basado en lenguaje natural y lo ejecuta.
     * @param question Pregunta del usuario en lenguaje natural.
     */
    processQuery(question) {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlQuery = yield this.generateSQL(question);
            console.log(`[SQLAgent] Query Generada: ${sqlQuery}`);
            const data = yield this.runSQL(sqlQuery);
            return { sql: sqlQuery, data };
        });
    }
    /**
     * Usa Gemini para convertir lenguaje natural a SQL.
     */
    generateSQL(question) {
        return __awaiter(this, void 0, void 0, function* () {
            const schemaContext = `
      Estás trabajando con una base de datos PostgreSQL para una farmacia. 
      Este es el esquema simplificado:
      
      Table usuario (id Int, nombre_completo String, email String, rol String, esta_activo Boolean)
      Table categoria (id Int, nombre String, descripcion String, emoji String)
      Table proveedor (id Int, nombre String, contacto String, email String)
      Table producto (id Int, nombre String, precio Decimal, stock Int, codigo_producto String, categoria_id Int, proveedor_id Int, fecha_vencimiento DateTime)
      Table cliente (id Int, nombre String, apellido String, email String, telefono String)
      Table venta (id Int, fecha DateTime, total Decimal, cliente_id Int, usuario_id Int)
      Table detalle_venta (id Int, venta_id Int, producto_id Int, cantidad Int, precio_unitario Decimal)

      Relaciones:
      - producto pertenece a categoria y proveedor.
      - venta tiene muchos detalle_venta.
    `;
            const prompt = `
      ${schemaContext}

      Eres un experto SQL. Traduce la pregunta a SQL PostgreSQL válido.
      
      Reglas:
      1. Solo genera la sentencia SQL. Sin markdown, sin explicaciones.
      2. Usa solo SELECT.
      3. Usa ILIKE para búsquedas de texto (case insensitive).
      4. Si piden precios o stock, incluye el nombre del producto.
      
      Pregunta: "${question}"
      SQL:
    `;
            try {
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                let text = response.text();
                // Limpieza de markdown
                return text.replace(/```sql/g, '').replace(/```/g, '').trim();
            }
            catch (error) {
                console.error('Error generando SQL con Gemini:', error);
                throw new Error('Error generando la consulta con IA.');
            }
        });
    }
    /**
     * Ejecuta la consulta SQL en la base de datos.
     */
    runSQL(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const sanitizedQuery = this.sanitize(query);
            try {
                const client = yield db_1.pool.connect();
                const result = yield client.query(sanitizedQuery);
                client.release();
                return result.rows;
            }
            catch (error) {
                console.error('Error ejecutando SQL:', error);
                throw new Error('Error al ejecutar la consulta SQL.');
            }
        });
    }
    sanitize(query) {
        const trimmedQuery = query.trim();
        if (!/^SELECT/i.test(trimmedQuery)) {
            throw new Error('Solo se permiten consultas SELECT por seguridad.');
        }
        return trimmedQuery;
    }
}
exports.SQLAgent = SQLAgent;
