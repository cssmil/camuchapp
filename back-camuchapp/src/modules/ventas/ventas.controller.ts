import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
  Query,
  Patch,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  crear(@Body() crearVentaDto: CrearVentaDto, @Req() req) {
    const usuarioId = req.user.id;
    return this.ventasService.crear(crearVentaDto, usuarioId);
  }

  @Get()
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerTodas(
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.ventasService.obtenerTodas(fecha_inicio, fecha_fin);
  }

  @Get(':id')
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.obtenerPorId(id);
  }

  @Patch(':id/anular')
  @Roles(RolUsuario.Administrador)
  anular(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const usuarioId = req.user.id;
    return this.ventasService.anular(id, usuarioId);
  }
}
