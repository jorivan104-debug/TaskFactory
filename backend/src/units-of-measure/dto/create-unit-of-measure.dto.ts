import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitOfMeasureDto {
  @ApiProperty({ example: 'm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  code: string;

  @ApiProperty({ example: 'Metro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;
}
