import { ArrayUnique, IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeasurementSheetDto {
  @ApiPropertyOptional({
    description:
      'Tallas a usar como columnas (uuids de Size). Si se omite, se usan las tallas de la curva de la OT.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  sizeIds?: string[];
}
