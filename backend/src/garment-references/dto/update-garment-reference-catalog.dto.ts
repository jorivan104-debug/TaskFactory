import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGarmentReferenceCatalogDto {
  @ApiPropertyOptional({ example: 'Chaqueta Denim Oversize' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'in_review' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @ApiPropertyOptional({ example: 'https://example.com/img.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
