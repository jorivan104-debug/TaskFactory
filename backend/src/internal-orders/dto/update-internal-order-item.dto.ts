import { PartialType } from '@nestjs/swagger';
import { CreateInternalOrderItemDto } from './create-internal-order-item.dto';

export class UpdateInternalOrderItemDto extends PartialType(CreateInternalOrderItemDto) {}
