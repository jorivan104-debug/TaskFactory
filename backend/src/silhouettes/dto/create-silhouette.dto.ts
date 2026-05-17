import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SILHOUETTE_GENDERS } from '../silhouette-genders';

export class CreateSilhouetteDto {
  @ApiProperty({ example: 'T-Shirt' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsUUID()
  silhouetteCategoryId: string;

  @ApiPropertyOptional({ enum: SILHOUETTE_GENDERS })
  @IsOptional()
  @IsIn([...SILHOUETTE_GENDERS])
  gender?: string;

  @ApiPropertyOptional({ description: 'URL o data URL de miniatura' })
  @IsOptional()
  @IsString()
  @MaxLength(500_000)
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
