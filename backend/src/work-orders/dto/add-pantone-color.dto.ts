import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddPantoneColorDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  pantoneColorId: string;

  @ApiPropertyOptional({ example: 'Main body color' })
  @IsOptional()
  @IsString()
  usageLabel?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
