import { PartialType } from '@nestjs/swagger';
import { CreateSilhouetteCategoryDto } from './create-silhouette-category.dto';

export class UpdateSilhouetteCategoryDto extends PartialType(CreateSilhouetteCategoryDto) {}
