import { PartialType } from '@nestjs/swagger';
import { CreateInternalOrderDto } from './create-internal-order.dto';

export class UpdateInternalOrderDto extends PartialType(CreateInternalOrderDto) {}
