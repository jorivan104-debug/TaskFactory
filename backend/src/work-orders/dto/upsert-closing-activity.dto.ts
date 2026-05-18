import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertClosingActivityDto {
  @ApiProperty({ example: 'Pegar botones' })
  @IsString()
  @MaxLength(255)
  activityName: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  performedBy?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
