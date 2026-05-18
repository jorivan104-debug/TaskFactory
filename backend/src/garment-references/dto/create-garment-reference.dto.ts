import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { REFERENCE_TYPES } from '../garment-reference-code.util';

export class CreateGarmentReferenceDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({ enum: REFERENCE_TYPES, example: 'muestra' })
  @IsString()
  @IsIn([...REFERENCE_TYPES])
  referenceType: string;

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

  @ApiPropertyOptional({ description: 'Foto frontal (miniatura en listado)' })
  @IsOptional()
  @IsString()
  garmentImageUrl1?: string;

  @ApiPropertyOptional({ description: 'Foto trasera' })
  @IsOptional()
  @IsString()
  garmentImageUrl2?: string;

  @ApiPropertyOptional({ description: 'Foto lateral' })
  @IsOptional()
  @IsString()
  garmentImageUrl3?: string;
}
