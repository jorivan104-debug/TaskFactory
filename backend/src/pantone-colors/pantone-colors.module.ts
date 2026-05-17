import { Module } from '@nestjs/common';
import { PantoneColorsController } from './pantone-colors.controller';
import { PantoneColorsService } from './pantone-colors.service';

@Module({
  controllers: [PantoneColorsController],
  providers: [PantoneColorsService],
})
export class PantoneColorsModule {}
