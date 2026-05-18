import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFabricPieceSheetDto {
  @ApiProperty({
    description: 'Insumo de tela en la OT al que pertenece la ficha',
    example: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  workOrderSupplyItemId: string;
}
