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
  ValidateNested,
} from 'class-validator';

export class ItemGastoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  costo: number;
}

export class CrearGastoDto {
  @IsInt()
  @IsOptional()
  proveedorId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemGastoDto)
  @IsNotEmpty()
  items: ItemGastoDto[];
}
