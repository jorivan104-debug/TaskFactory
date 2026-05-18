import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplyPriceDto {
  @ApiProperty({ example: 12500.5 })
  @IsNumber()
  @Min(0)
  purchaseUnitPrice: number;
}
