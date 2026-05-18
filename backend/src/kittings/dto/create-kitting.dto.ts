import { IsString, IsNotEmpty, IsUUID, IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class KittingItemDto {
  @ApiProperty()
  @IsUUID()
  workOrderSupplyItemId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.0001)
  quantity: number;
}

export class CreateKittingDto {
  @ApiProperty({ example: 'AL-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Blueprint node id for execution' })
  @IsString()
  @IsNotEmpty()
  executionStateKey: string;

  @ApiProperty()
  @IsUUID()
  sourceWarehouseId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [KittingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KittingItemDto)
  items: KittingItemDto[];
}
