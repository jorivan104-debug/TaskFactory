import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitOfMeasureDto {
  @ApiProperty({ example: 'Meter' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  abbreviation: string;
}
