import { PartialType } from '@nestjs/swagger';
import { CreateDevelopmentDto } from './create-development.dto';

export class UpdateDevelopmentDto extends PartialType(CreateDevelopmentDto) {}
