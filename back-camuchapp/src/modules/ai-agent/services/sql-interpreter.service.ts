import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqlInterpreterService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async interpret(question: string, data: any[]): Promise<string> {
    const prompt = `
      Actúa como un analista de datos experto y amable para una tienda de ropa.
      
      Pregunta original del usuario: "${question}"
      
      Datos obtenidos de la base de datos (JSON):
      ${JSON.stringify(data, null, 2)}

      Instrucciones:
      1. Analiza los datos y responde la pregunta del usuario de forma clara y concisa en español.
      2. Si hay muchos datos, resume los puntos clave o totales.
      3. Si la lista está vacía, indica amablemente que no se encontraron resultados.
      4. Dale formato a la respuesta (usa negritas para números importantes), pero no uses tablas Markdown complejas, prefiere listas o texto narrativo.
      5. No menciones "SQL" ni detalles técnicos de la base de datos.
      6. Recuerda que la moneda es en Soles peruanos.

      Respuesta:
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return 'Pude obtener los datos, pero tuve problemas para generar el resumen. Por favor revisa la tabla de resultados crudos si es posible.';
    }
  }
}
