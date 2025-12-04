import { Module } from '@nestjs/common';
import { AiAgentController } from './ai-agent.controller';
import { SqlInterpreterService } from './services/sql-interpreter.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

import { AiPersistenceService } from './services/ai-persistence.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [AiAgentController],
  providers: [
    SqlInterpreterService,
    AiPersistenceService,
  ],
})
export class AiAgentModule {}