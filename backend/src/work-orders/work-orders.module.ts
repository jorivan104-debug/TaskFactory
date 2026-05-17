import { Module } from '@nestjs/common';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { BlueprintEngineService } from './blueprint-engine.service';
import { WorkOrderTypesModule } from '../work-order-types/work-order-types.module';

@Module({
  imports: [WorkOrderTypesModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService, BlueprintEngineService],
})
export class WorkOrdersModule {}
