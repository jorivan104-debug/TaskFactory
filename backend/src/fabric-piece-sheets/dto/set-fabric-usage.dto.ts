import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetFabricUsageDto {
  @ApiProperty({ enum: ['main', 'pocket'] })
  @IsString()
  @IsIn(['main', 'pocket'])
  fabricUsage: string;
}
