import { pool } from '../config/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export class SQLAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('ADVERTENCIA: GEMINI_API_KEY no está definida en el archivo .env del MCP');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Proceso principal: Genera SQL basado en lenguaje natural y lo ejecuta.
   * @param question Pregunta del usuario en lenguaje natural.
   */
  async processQuery(question: string): Promise<{ sql: string, data: any[] }> {
    const sqlQuery = await this.generateSQL(question);
    console.log(`[SQLAgent] Query Generada: ${sqlQuery}`);
    const data = await this.runSQL(sqlQuery);
    return { sql: sqlQuery, data };
  }

  /**
   * Usa Gemini para convertir lenguaje natural a SQL.
   */
  private async generateSQL(question: string): Promise<string> {
    const schemaContext = `
      Estás trabajando con una base de datos PostgreSQL para una tienda de ropa. 
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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      // Limpieza de markdown
      return text.replace(/```sql/g, '').replace(/```/g, '').trim();
    } catch (error) {
      console.error('Error generando SQL con Gemini:', error);
      throw new Error('Error generando la consulta con IA.');
    }
  }

  /**
   * Ejecuta la consulta SQL en la base de datos.
   */
  private async runSQL(query: string): Promise<any> {
    const sanitizedQuery = this.sanitize(query);
    
    try {
      const client = await pool.connect();
      const result = await client.query(sanitizedQuery);
      client.release();
      return result.rows;
    } catch (error) {
      console.error('Error ejecutando SQL:', error);
      throw new Error('Error al ejecutar la consulta SQL.');
    }
  }

  private sanitize(query: string): string {
    const trimmedQuery = query.trim();
    if (!/^SELECT/i.test(trimmedQuery)) {
      throw new Error('Solo se permiten consultas SELECT por seguridad.');
    }
    return trimmedQuery;
  }
}
