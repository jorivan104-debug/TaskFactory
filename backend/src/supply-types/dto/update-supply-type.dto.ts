import { PartialType } from '@nestjs/swagger';
import { CreateSupplyTypeDto } from './create-supply-type.dto';

export class UpdateSupplyTypeDto extends PartialType(CreateSupplyTypeDto) {}
