import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  precio: number;

  @ApiProperty({ required: false })
  stock?: number;

  @ApiProperty({ required: false })
  descripcion?: string;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'La respuesta generada por el agente' })
  answer: string;

  @ApiProperty({ type: [ProductDto], description: 'Lista de productos relacionados o encontrados' })
  products: ProductDto[];

  @ApiProperty({ required: false, description: 'Consulta SQL generada (si aplica)' })
  sql?: string;

  @ApiProperty({ required: false, description: 'Fuentes utilizadas' })
  sources?: string[];

  @ApiProperty({ required: false, description: 'Traza de ejecución paso a paso' })
  trace?: string[];
}