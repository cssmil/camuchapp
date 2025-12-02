
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;
}
