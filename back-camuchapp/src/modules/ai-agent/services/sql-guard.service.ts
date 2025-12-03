import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SqlGuardService {
  validate(sql: string): boolean {
    const normalizedSql = sql.trim().toUpperCase();

    // 1. Asegurar que comienza con SELECT
    if (!normalizedSql.startsWith('SELECT') && !normalizedSql.startsWith('WITH')) {
      throw new BadRequestException('Por seguridad, solo se permiten consultas de lectura (SELECT).');
    }

    // 2. Lista negra de palabras clave peligrosas
    const forbiddenKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 
      'GRANT', 'REVOKE', 'CREATE', 'REPLACE', 'EXEC', 'EXECUTE',
      'UNION', 'MERGE', 'CALL'
    ];

    // Buscamos palabras completas para evitar falsos positivos (ej. "update_date" es válido)
    for (const keyword of forbiddenKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalizedSql)) {
        throw new BadRequestException(`La consulta contiene palabras clave no permitidas: ${keyword}`);
      }
    }

    // 3. Evitar múltiples sentencias (inyección básica por ';')
    if (normalizedSql.includes(';')) {
      // Permitimos ; solo si es el final absoluto
      if (normalizedSql.split(';').filter(part => part.trim().length > 0).length > 1) {
        throw new BadRequestException('No se permiten múltiples sentencias SQL.');
      }
    }

    return true;
  }
}
