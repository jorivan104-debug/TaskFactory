import { IsString, IsNotEmpty, IsInt, IsArray, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SizeCurveItemDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  sizeId: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class UpsertSizeCurveDto {
  @ApiProperty({ type: [SizeCurveItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeCurveItemDto)
  items: SizeCurveItemDto[];
}
