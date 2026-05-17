import { Module } from '@nestjs/common';
import { GarmentReferencesController } from './garment-references.controller';
import { GarmentReferencesService } from './garment-references.service';

@Module({
  controllers: [GarmentReferencesController],
  providers: [GarmentReferencesService],
})
export class GarmentReferencesModule {}
