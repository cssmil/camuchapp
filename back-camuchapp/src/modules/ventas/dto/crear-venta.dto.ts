import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class ItemVentaDto {
  @IsInt()
  @IsOptional()
  productoId?: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  precioUnitario?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @ValidateIf((o) => !o.productoId) // Requerido si no es un producto de inventario
  descripcionLibre?: string;
}

export class CrearVentaDto {
  @IsInt()
  @IsOptional()
  clienteId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemVentaDto)
  @IsNotEmpty()
  items: ItemVentaDto[];
}
