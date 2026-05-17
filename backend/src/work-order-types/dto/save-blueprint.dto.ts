import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveBlueprintDto {
  @ApiProperty({ description: 'React Flow graph definition (nodes + edges + initialStateKey)' })
  @IsObject()
  @IsNotEmpty()
  definitionJson: Record<string, unknown>;
}
