import { PartialType } from '@nestjs/swagger';
import { CreateGarmentReferenceDto } from './create-garment-reference.dto';

export class UpdateGarmentReferenceDto extends PartialType(CreateGarmentReferenceDto) {}
