import { PartialType } from '@nestjs/swagger';
import { CreateSilhouetteDto } from './create-silhouette.dto';

export class UpdateSilhouetteDto extends PartialType(CreateSilhouetteDto) {}
