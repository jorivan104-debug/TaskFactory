import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';
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
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  supplyId: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  productId?: string;

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

  @ApiProperty({
    example: 10,
    description: 'Cantidad; en ajuste puede ser negativa. En entrada/salida debe ser positiva.',
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  unitOfMeasureId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'purchase_order' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiPropertyOptional({ example: '2026-05-06T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
