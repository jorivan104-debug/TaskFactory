import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  RETURN = 'return',
}

export class CreateMovementDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ example: 'LOT-2026-001' })
  @IsOptional()
  @IsString()
  lotCode?: string;

  @ApiPropertyOptional({ example: 'SER-00001' })
  @IsOptional()
  @IsString()
  serialCode?: string;

  @ApiProperty({ enum: MovementType })
  @IsEnum(MovementType)
  movementType: MovementType;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  unitOfMeasureId: string;

  @ApiPropertyOptional({ example: 'purchase_order' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ example: '2026-05-06T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
