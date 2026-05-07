import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePantoneColorDto {
  @ApiProperty({ example: 'TCX' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  pantoneSystem: string;

  @ApiProperty({ example: '19-4052' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  pantoneCode: string;

  @ApiPropertyOptional({ example: 'Classic Blue' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: '#0F4C81' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  hexApprox?: string;
}
