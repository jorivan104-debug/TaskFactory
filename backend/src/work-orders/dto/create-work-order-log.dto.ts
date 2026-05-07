import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkOrderLogDto {
  @ApiProperty({ example: 'status_change' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  entryType: string;

  @ApiProperty({ example: 'Status changed to in_progress' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  summary: string;

  @ApiPropertyOptional({ example: 'Detailed description of the change' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ example: '{"key":"value"}' })
  @IsOptional()
  @IsString()
  metadataJson?: string;

  @ApiPropertyOptional({ example: '{"field":"status","old":"pending","new":"in_progress"}' })
  @IsOptional()
  @IsString()
  changesJson?: string;

  @ApiPropertyOptional({ example: '2026-05-06T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  performedAt?: string;
}
