import { PartialType } from '@nestjs/swagger';
import { CreatePantoneColorDto } from './create-pantone-color.dto';

export class UpdatePantoneColorDto extends PartialType(CreatePantoneColorDto) {}
