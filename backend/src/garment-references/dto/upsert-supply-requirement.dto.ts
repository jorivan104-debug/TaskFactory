import { IsUUID, IsNumber, IsOptional, IsString, Min, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertSupplyRequirementDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  supplyId: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  @Min(0)
  quantityPerGarment: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 15000, description: 'Valor unitario del insumo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;
}
