import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplyWithInventoryDto {
  @ApiProperty({ example: 'Tela algodón 100%' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  supplyTypeId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  unitOfMeasureId: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  defaultSupplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseUnitPrice?: number;

  @ApiPropertyOptional({
    description: 'Si se indica almacén y cantidad, crea un movimiento de ajuste inicial',
  })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ example: 0 })
  @ValidateIf((o) => o.warehouseId != null && o.warehouseId !== '')
  @IsNumber()
  initialQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  initialNotes?: string;
}
