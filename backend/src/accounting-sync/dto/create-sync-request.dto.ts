import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSyncRequestDto {
  @ApiProperty({ example: '{"invoiceId":"uuid","type":"invoice_sync"}' })
  @IsString()
  @IsNotEmpty()
  payloadJson: string;
}
