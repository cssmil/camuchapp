import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const url = configService.get<string>('DATABASE_URL');

    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }

    const urlParts = new URL(url);

    const adapter = new PrismaMariaDb({
      host: urlParts.hostname,
      port: parseInt(urlParts.port, 10),
      user: urlParts.username,
      password: urlParts.password,
      database: urlParts.pathname.substring(1), // Remove leading '/'
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
