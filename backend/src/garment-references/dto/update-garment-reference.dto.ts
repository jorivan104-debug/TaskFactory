import { IsString, IsOptional, IsUUID, IsBoolean, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGarmentReferenceDto {
  @ApiPropertyOptional({ example: 'Chaqueta denim' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
