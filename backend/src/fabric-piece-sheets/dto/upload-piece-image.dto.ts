import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadPieceImageDto {
  @ApiPropertyOptional({
    description: 'Imagen como data URL (image/jpeg|png|webp). Pasar string vacío o null para quitar la imagen.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2_000_000)
  imageUrl?: string | null;
}
