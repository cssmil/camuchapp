import { Module } from '@nestjs/common';
import { AiAgentController } from './ai-agent.controller';
import { SqlGeneratorService } from './services/sql-generator.service';
import { SqlGuardService } from './services/sql-guard.service';
import { SqlExecutorService } from './services/sql-executor.service';
import { SqlInterpreterService } from './services/sql-interpreter.service';
import { PrismaModule } from '../../prisma/prisma.module';

import { AiPersistenceService } from './services/ai-persistence.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiAgentController],
  providers: [
    SqlGeneratorService,
    SqlGuardService,
    SqlExecutorService,
    SqlInterpreterService,
    AiPersistenceService,
  ],
})
export class AiAgentModule {}
