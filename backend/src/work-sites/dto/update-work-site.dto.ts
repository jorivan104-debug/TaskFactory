import { PartialType } from '@nestjs/swagger';
import { CreateWorkSiteDto } from './create-work-site.dto';

export class UpdateWorkSiteDto extends PartialType(CreateWorkSiteDto) {}
