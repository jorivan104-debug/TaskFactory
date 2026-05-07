import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentAllocationDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  amount: number;
}
