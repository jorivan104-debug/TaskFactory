import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SUPPLIER_TYPES } from '../supplier-types';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Patronista García' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  legalName: string;

  @ApiPropertyOptional({ example: 'García Patrones' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @ApiProperty({ enum: SUPPLIER_TYPES, example: 'patronista' })
  @IsString()
  @IsIn([...SUPPLIER_TYPES])
  supplierType: string;

  @ApiPropertyOptional({ example: 'María García' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  taxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
