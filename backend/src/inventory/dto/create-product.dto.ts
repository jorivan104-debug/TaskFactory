import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductType {
  RAW_MATERIAL = 'raw_material',
  FINISHED_GOOD = 'finished_good',
  SUPPLY = 'supply',
  PACKAGING = 'packaging',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Denim Fabric 12oz' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'SKU-DEN-12' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiPropertyOptional({ example: 'Heavy denim for jeans' })
  @IsOptional()
  @IsString()
  description?: string;
}
