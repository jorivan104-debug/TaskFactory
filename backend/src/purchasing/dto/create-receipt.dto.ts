import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsDateString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReceiptItemDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  purchaseOrderItemId: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  quantityReceived: number;

  @ApiPropertyOptional({ example: 'Good condition' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateReceiptDto {
  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ example: '2026-05-06T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  receivedAt?: string;

  @ApiPropertyOptional({ example: 'Received at dock B' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [ReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];
}
