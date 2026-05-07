import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductionType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  MIXED = 'mixed',
}

export enum ProductionOrderStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateProductionOrderDto {
  @ApiProperty({ example: 'OP-2026-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  workSiteId: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  developmentId?: string;

  @ApiProperty({ enum: ProductionType })
  @IsEnum(ProductionType)
  productionType: ProductionType;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
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

  @ApiPropertyOptional({ enum: ProductionOrderStatus, default: ProductionOrderStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;
}
