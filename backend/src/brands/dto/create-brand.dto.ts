import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'Nike' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'NK' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  abbreviation: string;

  @ApiProperty({ example: 150, description: 'Consecutivo de marca (100-999), 3 dígitos' })
  @IsInt()
  @Min(100)
  @Max(999)
  consecutivo: number;

  @ApiPropertyOptional({ example: 1, description: 'Deprecated: use consecutivo' })
  @IsOptional()
  @IsInt()
  @Min(0)
  nextReferenceSequence?: number;
}
