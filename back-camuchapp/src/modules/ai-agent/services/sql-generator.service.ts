import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqlGeneratorService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    // Nota: Asegúrate de agregar GEMINI_API_KEY a tu .env
    if (!apiKey) {
        console.warn('GEMINI_API_KEY no está definida en las variables de entorno');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateSql(question: string, history: any[] = []): Promise<string> {
    // Definición simplificada del esquema para el contexto
    const schemaContext = `
      Estás trabajando con una base de datos PostgreSQL. Este es el esquema prisma:
      
      Table usuario (id Int, nombre_completo String, email String, rol Enum(Administrador, Colaborador), esta_activo Boolean)
      Table categoria (id Int, nombre String, descripcion String, emoji String)
      Table proveedor (id Int, nombre String, contacto String, email String)
      Table producto (id Int, nombre String, precio Decimal, stock Int, codigo_producto String, categoria_id Int, proveedor_id Int, fecha_vencimiento DateTime)
      Table cliente (id Int, nombre String, apellido String, email String, telefono String)
      Table venta (id Int, fecha DateTime, total Decimal, cliente_id Int, usuario_id Int)
      Table detalle_venta (id Int, venta_id Int, producto_id Int, cantidad Int, precio_unitario Decimal, descripcion_libre String)
      Table gasto (id Int, fecha DateTime, total Decimal, proveedor_id Int, usuario_id Int)
      Table detalle_gasto (id Int, gasto_id Int, descripcion String, costo Decimal)

      Relaciones:
      - producto pertenece a categoria y proveedor.
      - venta tiene muchos detalle_venta.
      - venta pertenece a cliente y usuario.
    `;

    let historyContext = "";
    if (history && history.length > 0) {
        historyContext = `
        Contexto de la conversación previa (ÚSALO SOLO SI LA PREGUNTA HACE REFERENCIA A ESTO):
        ${history.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}
        `;
    }

    const prompt = `
      ${schemaContext}
      ${historyContext}

      Eres un experto SQL. Tu tarea es traducir la siguiente pregunta de lenguaje natural a una consulta SQL válida para PostgreSQL.

      Reglas:
      1. Solo genera la sentencia SQL. Sin markdown, sin explicaciones, sin comillas de código.
      2. Usa solo SELECT.
      3. Si la pregunta es ambigua, asume la interpretación más lógica basada en ventas y productos de farmacia.
      4. Usa nombres de tablas y columnas exactos como se definieron arriba.
      5. Para fechas, usa funciones estándar de PostgreSQL (ej. CURRENT_DATE).
      6. Si piden "ventas de hoy", filtra por fecha actual.

      Pregunta: "${question}"
      SQL:
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Limpieza básica por si el modelo devuelve markdown
      text = text.replace(/```sql/g, '').replace(/```/g, '').trim();
      
      return text;
    } catch (error) {
      console.error('Error generando SQL:', error);
      throw new InternalServerErrorException('Error al generar la consulta SQL con IA.');
    }
  }
}
