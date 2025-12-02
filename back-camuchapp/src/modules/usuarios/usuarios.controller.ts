
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('usuarios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(RolUsuario.Administrador)
  create(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.create(crearUsuarioDto);
  }

  @Get()
  @Roles(RolUsuario.Administrador)
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @Roles(RolUsuario.Administrador)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.Administrador)
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarUsuarioDto: ActualizarUsuarioDto) {
    return this.usuariosService.update(id, actualizarUsuarioDto);
  }

  @Delete(':id')
  @Roles(RolUsuario.Administrador)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
