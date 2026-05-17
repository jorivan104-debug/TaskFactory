import { IsString, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertGarmentReferenceDto {
  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  silhouetteId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  fabricSupplyId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  pantoneColorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  garmentImageUrl1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  garmentImageUrl2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  garmentImageUrl3?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cutGarmentsQty?: number;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsInt()
  @Min(0)
  programmedGarmentsQty?: number;
}
