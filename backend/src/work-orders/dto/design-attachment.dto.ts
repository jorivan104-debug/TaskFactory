import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DesignAttachmentDto {
  @ApiProperty({ description: 'Identificador del anexo (uuid)' })
  @IsString()
  @MaxLength(64)
  id: string;

  @ApiProperty({ description: 'Nombre original del archivo' })
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ description: 'Fecha de subida ISO 8601' })
  @IsDateString()
  uploadedAt: string;

  @ApiPropertyOptional({ description: 'Contenido como data URL embebido' })
  @IsOptional()
  @IsString()
  dataUrl?: string;
}
