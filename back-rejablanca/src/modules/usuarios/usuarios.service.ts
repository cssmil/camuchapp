import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(crearUsuarioDto: CrearUsuarioDto) {
    const { password, ...userData } = crearUsuarioDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const usuario = await this.prisma.usuario.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = usuario;
    return result;
  }

  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      where: { esta_activo: true },
      select: {
        id: true,
        nombre_completo: true,
        email: true,
        rol: true,
        creado_en: true,
        actualizado_en: true,
      },
    });
    return usuarios;
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id, esta_activo: true },
      select: {
        id: true,
        nombre_completo: true,
        email: true,
        rol: true,
        creado_en: true,
        actualizado_en: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID #${id} no encontrado`);
    }

    return usuario;
  }

  async update(id: number, actualizarUsuarioDto: ActualizarUsuarioDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = actualizarUsuarioDto;
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userData['password'] = hashedPassword;
    }

    try {
      const usuarioActualizado = await this.prisma.usuario.update({
        where: { id },
        data: userData,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = usuarioActualizado;
      return result;
    } catch (error) {
      throw new NotFoundException(`No se pudo actualizar el usuario con ID #${id}. Es posible que no exista.`);
    }
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        esta_activo: false,
        fecha_eliminado: new Date(),
      },
    });

    return { message: `Usuario con ID #${id} ha sido eliminado.` };
  }
}
