import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({
    description: 'La pregunta o mensaje del usuario',
    example: '¿Qué precio tiene el paracetamol de 500mg?',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  message: string;
}
