import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGarmentReferenceDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  silhouetteId: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  fabricSupplyId: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  pantoneColorId?: string;

  @ApiPropertyOptional({ example: ['https://example.com/img1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cutQuantity?: number;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsInt()
  @Min(0)
  programmedQuantity?: number;
}
