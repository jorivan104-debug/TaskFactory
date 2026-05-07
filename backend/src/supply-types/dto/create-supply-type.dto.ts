import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplyTypeDto {
  @ApiProperty({ example: 'Fabric' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
