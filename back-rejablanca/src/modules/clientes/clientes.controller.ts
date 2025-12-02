import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  crear(@Body() crearClienteDto: CrearClienteDto, @Req() req) {
    const usuarioId = req.user.id;
    return this.clientesService.crear(crearClienteDto, usuarioId);
  }

  @Get()
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerTodos() {
    return this.clientesService.obtenerTodos();
  }

  @Get(':id')
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarClienteDto: ActualizarClienteDto,
    @Req() req,
  ) {
    const usuarioId = req.user.id;
    return this.clientesService.actualizar(id, actualizarClienteDto, usuarioId);
  }

  @Delete(':id')
  @Roles(RolUsuario.Administrador) // Solo los administradores pueden eliminar
  eliminar(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const usuarioId = req.user.id;
    return this.clientesService.eliminar(id, usuarioId);
  }
}
