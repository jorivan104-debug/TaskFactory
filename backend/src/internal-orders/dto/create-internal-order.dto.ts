import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InternalOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONVERTED = 'converted',
  CANCELLED = 'cancelled',
}

export class CreateInternalOrderDto {
  @ApiPropertyOptional({ example: 'PI-2026-001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  workSiteId: string;

  @ApiPropertyOptional({ example: 'Need 200 units of T-shirts for store' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: InternalOrderStatus, default: InternalOrderStatus.DRAFT })
  @IsOptional()
  @IsEnum(InternalOrderStatus)
  status?: InternalOrderStatus;
}
