import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    // Configurar la zona horaria de la sesión de base de datos a Perú (GMT-5)
    await this.$queryRawUnsafe("SET timezone = 'America/Lima';");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
