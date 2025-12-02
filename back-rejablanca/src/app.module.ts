import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProductosModule } from './modules/productos/productos.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { GastosModule } from './modules/gastos/gastos.module';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
    }),
    PrismaModule, // Módulo de Prisma ahora es global
    AuthModule,
    ProductosModule,
    CategoriasModule,
    UsuariosModule,
    ClientesModule,
    VentasModule,
    GastosModule,
    ProveedoresModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

