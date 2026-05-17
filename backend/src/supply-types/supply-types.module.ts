import { Module } from '@nestjs/common';
import { SupplyTypesController } from './supply-types.controller';
import { SupplyTypesService } from './supply-types.service';

@Module({
  controllers: [SupplyTypesController],
  providers: [SupplyTypesService],
})
export class SupplyTypesModule {}
