import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkSiteDto {
  @ApiProperty({ example: 'PLT-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code: string;

  @ApiProperty({ example: 'Main Factory' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
