
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductosModule } from '../productos/productos.module';

@Module({
  imports: [PrismaModule, ProductosModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
