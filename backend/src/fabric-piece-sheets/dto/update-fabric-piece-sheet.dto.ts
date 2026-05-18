import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFabricPieceSheetDto {
  @ApiPropertyOptional({ enum: ['draft', 'active', 'closed'] })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'active', 'closed'])
  status?: string;

  @ApiPropertyOptional({ example: '2026-05-18' })
  @IsOptional()
  @IsDateString()
  sheetDate?: string;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sizesPlaced?: number;

  @ApiPropertyOptional({ example: 1.22 })
  @IsOptional()
  @IsNumber()
  realAverage?: number;

  @ApiPropertyOptional({ example: 21.62 })
  @IsOptional()
  @IsNumber()
  markerLength?: number;

  @ApiPropertyOptional({ example: '13 ; 21073 ; 16.21 TIKES' })
  @IsOptional()
  @IsString()
  labeledPiecesNotes?: string;

  @ApiPropertyOptional({ example: 'NO HAY' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pocketFabricNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasBias?: boolean;

  @ApiPropertyOptional({ example: 1783.1 })
  @IsOptional()
  @IsNumber()
  biasWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasElastic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasZipper?: boolean;

  @ApiPropertyOptional({ example: 14.751 })
  @IsOptional()
  @IsNumber()
  zipperWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasLuxuryZipper?: boolean;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  programmedQty?: number;

  @ApiPropertyOptional({ example: 1977.6 })
  @IsOptional()
  @IsNumber()
  metersToUse?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  leftoverMeters?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
