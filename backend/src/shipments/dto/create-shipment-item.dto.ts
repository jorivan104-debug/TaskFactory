import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentItemDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  lotCode?: string;

  @ApiPropertyOptional({ example: 'Box 1 of 3' })
  @IsOptional()
  @IsString()
  notes?: string;
}
