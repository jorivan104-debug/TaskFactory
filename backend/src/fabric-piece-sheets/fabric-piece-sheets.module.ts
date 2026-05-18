import { Module } from '@nestjs/common';
import { FabricPieceSheetsController } from './fabric-piece-sheets.controller';
import { FabricPieceSheetsService } from './fabric-piece-sheets.service';

@Module({
  controllers: [FabricPieceSheetsController],
  providers: [FabricPieceSheetsService],
  exports: [FabricPieceSheetsService],
})
export class FabricPieceSheetsModule {}
