
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class ActualizarUsuarioDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @IsString()
  @IsOptional()
  nombre_completo?: string;

  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;
}
