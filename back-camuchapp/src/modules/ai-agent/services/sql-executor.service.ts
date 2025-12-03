import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SqlExecutorService {
  constructor(private prisma: PrismaService) {}

  async execute(sql: string): Promise<any[]> {
    try {
      // queryRawUnsafe permite ejecutar strings SQL crudos
      const result = await this.prisma.$queryRawUnsafe(sql);
      
      // Serializar BigInts si existen (Prisma devuelve BigInt que no es serializable a JSON por defecto)
      return JSON.parse(JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
    } catch (error) {
      console.error('Error ejecutando SQL:', error);
      throw new InternalServerErrorException(`Error al ejecutar la consulta en base de datos: ${error.message}`);
    }
  }
}
