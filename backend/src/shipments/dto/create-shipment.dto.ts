import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class CreateShipmentDto {
  @ApiPropertyOptional({ example: 'ENV-2026-001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  originWarehouseId: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  destinationWarehouseId?: string;

  @ApiPropertyOptional({ example: 'Calle 123, Bogota' })
  @IsOptional()
  @IsString()
  destinationAddress?: string;

  @ApiPropertyOptional({ example: 'Transportadora XYZ' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  carrier?: string;

  @ApiPropertyOptional({ example: 'TRK-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingCode?: string;

  @ApiPropertyOptional({ enum: ShipmentStatus, default: ShipmentStatus.PENDING })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @ApiPropertyOptional({ example: '2026-05-07T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryAt?: string;

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsOptional()
  @IsString()
  notes?: string;
}
