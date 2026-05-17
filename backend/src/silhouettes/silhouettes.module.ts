import { Module } from '@nestjs/common';
import { SilhouettesController } from './silhouettes.controller';
import { SilhouettesService } from './silhouettes.service';

@Module({
  controllers: [SilhouettesController],
  providers: [SilhouettesService],
})
export class SilhouettesModule {}
