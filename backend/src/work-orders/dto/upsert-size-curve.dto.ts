import { IsString, IsNotEmpty, IsInt, IsArray, Min, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SizeCurveItemDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  sizeId: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  programmedQty: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cutQty?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpsertSizeCurveDto {
  @ApiProperty({ type: [SizeCurveItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeCurveItemDto)
  items: SizeCurveItemDto[];
}
