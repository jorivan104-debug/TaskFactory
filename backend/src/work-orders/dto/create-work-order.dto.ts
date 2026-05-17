import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkOrderDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productionOrderId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  workOrderTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  workSiteId?: string;

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
}
