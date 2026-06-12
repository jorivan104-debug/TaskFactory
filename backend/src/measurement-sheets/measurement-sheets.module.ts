import { Module } from '@nestjs/common';
import { MeasurementSheetsController } from './measurement-sheets.controller';
import { MeasurementSheetsService } from './measurement-sheets.service';

@Module({
  controllers: [MeasurementSheetsController],
  providers: [MeasurementSheetsService],
  exports: [MeasurementSheetsService],
})
export class MeasurementSheetsModule {}
