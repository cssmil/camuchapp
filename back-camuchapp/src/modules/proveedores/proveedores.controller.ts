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
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { ActualizarProveedorDto } from './dto/actualizar-proveedor.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @Roles(RolUsuario.Administrador)
  crear(@Body() crearProveedorDto: CrearProveedorDto) {
    return this.proveedoresService.crear(crearProveedorDto);
  }

  @Get()
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerTodos() {
    return this.proveedoresService.obtenerTodos();
  }

  @Get(':id')
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.Administrador)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarProveedorDto: ActualizarProveedorDto,
  ) {
    return this.proveedoresService.actualizar(id, actualizarProveedorDto);
  }

  @Delete(':id')
  @Roles(RolUsuario.Administrador)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.eliminar(id);
  }
}
