import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MeasurementCellPayload {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  garmentMeasurementPointId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  sizeId: string;

  @ApiPropertyOptional({ example: 92.5, description: 'Valor en centímetros (null borra la celda)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valueCm?: number | null;
}

export class UpsertMeasurementCellsDto {
  @ApiProperty({ type: [MeasurementCellPayload] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeasurementCellPayload)
  cells: MeasurementCellPayload[];
}

export class UpdateMeasurementSheetDto {
  @ApiPropertyOptional({ enum: ['draft', 'active', 'closed'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
