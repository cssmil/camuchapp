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
import { GastosService } from './gastos.service';
import { CrearGastoDto } from './dto/crear-gasto.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  crear(@Body() crearGastoDto: CrearGastoDto, @Req() req) {
    const usuarioId = req.user.id;
    return this.gastosService.crear(crearGastoDto, usuarioId);
  }

  @Get()
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerTodos(
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.gastosService.obtenerTodos(fecha_inicio, fecha_fin);
  }

  @Get(':id')
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.gastosService.obtenerPorId(id);
  }

  @Patch(':id/anular')
  @Roles(RolUsuario.Administrador)
  anular(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const usuarioId = req.user.id;
    return this.gastosService.anular(id, usuarioId);
  }
}
