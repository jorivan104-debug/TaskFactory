import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MeasurementSheetsService } from './measurement-sheets.service';
import { CreateMeasurementSheetDto } from './dto/create-measurement-sheet.dto';
import {
  UpdateMeasurementSheetDto,
  UpsertMeasurementCellsDto,
} from './dto/upsert-cell.dto';

@ApiTags('Measurement Sheets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MeasurementSheetsController {
  constructor(private readonly service: MeasurementSheetsService) {}

  @Get('garment-measurement-points')
  @ApiOperation({ summary: 'Listar catálogo de puntos de medida' })
  listPoints() {
    return this.service.listPoints();
  }

  @Get('work-orders/:workOrderId/measurement-sheet')
  @ApiOperation({ summary: 'Obtener tabla de medidas de la OT (null si no existe)' })
  findOne(@Param('workOrderId') workOrderId: string) {
    return this.service.findOne(workOrderId);
  }

  @Post('work-orders/:workOrderId/measurement-sheet')
  @ApiOperation({ summary: 'Crear tabla de medidas 1:1 con la OT' })
  create(
    @Param('workOrderId') workOrderId: string,
    @Body() dto: CreateMeasurementSheetDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.create(workOrderId, dto, user.id);
  }

  @Patch('work-orders/:workOrderId/measurement-sheet')
  @ApiOperation({ summary: 'Actualizar metadatos de la tabla de medidas' })
  update(
    @Param('workOrderId') workOrderId: string,
    @Body() dto: UpdateMeasurementSheetDto,
  ) {
    return this.service.update(workOrderId, dto);
  }

  @Put('work-orders/:workOrderId/measurement-sheet/cells')
  @ApiOperation({ summary: 'Guardar valores de celdas (batch upsert)' })
  upsertCells(
    @Param('workOrderId') workOrderId: string,
    @Body() dto: UpsertMeasurementCellsDto,
  ) {
    return this.service.upsertCells(workOrderId, dto);
  }

  @Delete('work-orders/:workOrderId/measurement-sheet')
  @ApiOperation({ summary: 'Eliminar tabla de medidas de la OT' })
  remove(@Param('workOrderId') workOrderId: string) {
    return this.service.remove(workOrderId);
  }
}
