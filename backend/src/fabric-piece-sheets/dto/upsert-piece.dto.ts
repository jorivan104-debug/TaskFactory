import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertPieceDto {
  @ApiProperty({ example: 'PRETINA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @ApiPropertyOptional({ enum: [0, 1, 2], default: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2])
  materialSlot?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPair?: boolean;

  @ApiPropertyOptional({ description: 'Imagen como data URL o URL pública' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Instrucciones de corte de la pieza' })
  @IsOptional()
  @IsString()
  cutInstructions?: string;

  @ApiPropertyOptional({ description: 'Instrucciones de agrupación de la pieza' })
  @IsOptional()
  @IsString()
  groupInstructions?: string;

  @ApiPropertyOptional({ example: 100, description: 'Cantidad de prendas que rinde la pieza' })
  @IsOptional()
  @IsInt()
  @Min(0)
  garmentsYield?: number;

  @ApiPropertyOptional({ example: 1.25, description: 'Gasto de tela por pieza' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fabricUsage?: number;
}
