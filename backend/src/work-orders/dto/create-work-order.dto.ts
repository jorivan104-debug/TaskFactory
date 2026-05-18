import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsIn,
  Min,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { REFERENCE_TYPES } from '../../garment-references/garment-reference-code.util';

export class CreateGarmentReferencePayload {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({ enum: REFERENCE_TYPES, example: 'muestra' })
  @IsString()
  @IsIn([...REFERENCE_TYPES])
  referenceType: string;

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

export class SizeCurveItemPayload {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  sizeId: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  programmedQty: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cutQty?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  workSiteId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  workOrderTypeId?: string;

  @ApiProperty({ example: 'OT-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code: string;

  @ApiPropertyOptional({ example: 'Corte lote A' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ default: 'pending' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({ example: 'development' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  productionType?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  patternSupplierId?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  patterningDays?: number;

  @ApiPropertyOptional({ example: 'Special stitching on collar' })
  @IsOptional()
  @IsString()
  designInstructions?: string;

  @ApiPropertyOptional({ description: 'Catalog garment reference to copy BOM from' })
  @IsOptional()
  @IsUUID()
  catalogGarmentReferenceId?: string;

  @ApiPropertyOptional({ type: CreateGarmentReferencePayload })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGarmentReferencePayload)
  garmentReference?: CreateGarmentReferencePayload;

  @ApiPropertyOptional({ type: [SizeCurveItemPayload] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeCurveItemPayload)
  sizeCurve?: SizeCurveItemPayload[];
}
