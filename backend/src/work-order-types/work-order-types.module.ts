import { Module } from '@nestjs/common';
import { WorkOrderTypesController } from './work-order-types.controller';
import { WorkOrderTypesService } from './work-order-types.service';

@Module({
  controllers: [WorkOrderTypesController],
  providers: [WorkOrderTypesService],
  exports: [WorkOrderTypesService],
})
export class WorkOrderTypesModule {}
