import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(RolUsuario.Administrador)
  @UseInterceptors(FileInterceptor('foto'))
  create(
    @Body() crearProductoDto: CrearProductoDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const usuario_id = req.user.id;
    return this.productosService.create(crearProductoDto, usuario_id, file);
  }

  @Post(':id/add-stock')
  @Roles(RolUsuario.Administrador)
  addStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('cantidad', ParseIntPipe) cantidad: number,
    @Request() req,
  ) {
    const usuario_id = req.user.id;
    return this.productosService.addStock(id, cantidad, usuario_id);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get('alertas/por-vencer')
  @Roles(RolUsuario.Administrador, RolUsuario.Colaborador)
  obtenerProductosPorVencer(
    @Query('dias', new ParseIntPipe({ optional: true })) dias?: number,
  ) {
    return this.productosService.obtenerProductosPorVencer(dias);
  }

  @Get('buscar/:termino')
  buscar(@Param('termino') termino: string) {
    return this.productosService.buscar(termino);
  }

  @Get('history/all')
  @Roles(RolUsuario.Administrador)
  getAllHistory() {
    return this.productosService.getAllHistory();
  }

  @Get('history/:id')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.getHistory(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.Administrador)
  @UseInterceptors(FileInterceptor('foto'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarProductoDto: ActualizarProductoDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const usuario_id = req.user.id;
    return this.productosService.update(
      id,
      actualizarProductoDto,
      usuario_id,
      file,
    );
  }

  @Delete(':id')
  @Roles(RolUsuario.Administrador)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const usuario_id = req.user.id;
    return this.productosService.remove(id, usuario_id);
  }
}

