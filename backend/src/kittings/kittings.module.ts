import { Module } from '@nestjs/common';
import { KittingsController } from './kittings.controller';
import { KittingsService } from './kittings.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [KittingsController],
  providers: [KittingsService],
  exports: [KittingsService],
})
export class KittingsModule {}
