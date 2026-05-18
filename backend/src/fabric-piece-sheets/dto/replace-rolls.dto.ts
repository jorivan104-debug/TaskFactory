import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RollItemDto {
  @ApiProperty({ example: '#1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  rollNumber: string;

  @ApiProperty({ example: 250.5 })
  @IsNumber()
  @Min(0)
  meters: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReplaceRollsDto {
  @ApiProperty({ type: [RollItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RollItemDto)
  items: RollItemDto[];
}
