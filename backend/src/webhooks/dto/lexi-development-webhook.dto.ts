import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LexiDevelopmentWebhookDto {
  @ApiProperty({ example: 'lexi-ext-12345' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ example: 'Summer Jacket v2' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'https://lexi.example.com/images/jacket.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '{"season":"summer","year":2026}' })
  @IsOptional()
  @IsString()
  attributesJson?: string;

  @ApiPropertyOptional({ example: 'received' })
  @IsOptional()
  @IsString()
  status?: string;
}
