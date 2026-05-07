import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DevelopmentStatus {
  RECEIVED = 'received',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  IN_PRODUCTION = 'in_production',
  SAMPLE_COMPLETE = 'sample_complete',
  ARCHIVED = 'archived',
  REJECTED = 'rejected',
}

export class CreateDevelopmentDto {
  @ApiProperty({ example: 'Summer Collection Jacket' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '{"color":"blue","material":"denim"}' })
  @IsOptional()
  @IsString()
  attributesJson?: string;

  @ApiPropertyOptional({ enum: DevelopmentStatus, default: DevelopmentStatus.RECEIVED })
  @IsOptional()
  @IsEnum(DevelopmentStatus)
  status?: DevelopmentStatus;
}
