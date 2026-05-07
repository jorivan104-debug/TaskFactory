import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSilhouetteCategoryDto {
  @ApiProperty({ example: 'Tops' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
