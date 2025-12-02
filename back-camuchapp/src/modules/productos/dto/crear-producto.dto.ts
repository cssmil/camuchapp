import { IsString, IsNotEmpty, IsNumber, IsInt, IsOptional, Min, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CrearProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @Type(() => Number)
  @IsInt()
  categoria_id: number;

  @Transform(({ value }) => (value ? Number(value) : null))
  @IsInt()
  @IsOptional()
  proveedor_id?: number | null;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(0)
  stock_minimo?: number;

  @IsString()
  @IsOptional()
  foto_url?: string;

  @IsDateString()
  @IsOptional()
  fecha_vencimiento?: string;
}
