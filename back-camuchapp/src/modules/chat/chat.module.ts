import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule, 
    ConfigModule,
    ScheduleModule.forRoot(), // Para el cron de embeddings
    ThrottlerModule.forRoot([{
        ttl: 60000,
        limit: 10,
    }]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
