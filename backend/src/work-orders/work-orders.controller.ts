import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpsertGarmentReferenceDto } from './dto/upsert-garment-reference.dto';
import { UpsertSizeCurveDto } from './dto/upsert-size-curve.dto';
import { AddPantoneColorDto } from './dto/add-pantone-color.dto';
import { CreateWorkOrderLogDto } from './dto/create-work-order-log.dto';

@ApiTags('Work Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly service: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'workSiteId', required: false })
  @ApiQuery({ name: 'productionType', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('workSiteId') workSiteId?: string,
    @Query('productionType') productionType?: string,
  ) {
    return this.service.findAll({ status, workSiteId, productionType });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work order by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create work order' })
  create(@Body() dto: CreateWorkOrderDto, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update work order' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close work order' })
  close(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.close(id, user.id);
  }

  // ── Garment Reference ──

  @Post(':id/garment-reference')
  @ApiOperation({ summary: 'Create or update garment reference' })
  upsertGarmentReference(
    @Param('id') id: string,
    @Body() dto: UpsertGarmentReferenceDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.upsertGarmentReference(id, dto, user.id);
  }

  // ── Size Curve ──

  @Post(':id/size-curve')
  @ApiOperation({ summary: 'Upsert size curve items' })
  upsertSizeCurve(
    @Param('id') id: string,
    @Body() dto: UpsertSizeCurveDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.upsertSizeCurve(id, dto, user.id);
  }

  // ── Blueprint Flow ──

  @Get(':id/flow')
  @ApiOperation({ summary: 'Get current blueprint state and available transitions' })
  getFlow(@Param('id') id: string) {
    return this.service.getFlow(id);
  }

  @Post(':id/transitions/:transitionId')
  @ApiOperation({ summary: 'Execute a blueprint transition' })
  executeTransition(
    @Param('id') id: string,
    @Param('transitionId') transitionId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.executeTransition(id, transitionId, user.id);
  }

  // ── Supply Items ──

  @Get(':id/supply-items')
  @ApiOperation({ summary: 'List supply items for work order' })
  findSupplyItems(@Param('id') id: string) {
    return this.service.findSupplyItems(id);
  }

  @Post(':id/supply-items')
  @ApiOperation({ summary: 'Add or update a supply item' })
  upsertSupplyItem(
    @Param('id') id: string,
    @Body() dto: { supplyId: string; quantityPerGarment: number; notes?: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.service.upsertSupplyItem(id, dto, user.id);
  }

  @Delete(':id/supply-items/:supplyId')
  @ApiOperation({ summary: 'Remove a supply item' })
  removeSupplyItem(
    @Param('id') id: string,
    @Param('supplyId') supplyId: string,
  ) {
    return this.service.removeSupplyItem(id, supplyId);
  }

  // ── Pantone Colors ──

  @Post(':id/pantone-colors')
  @ApiOperation({ summary: 'Add pantone color to work order' })
  addPantoneColor(
    @Param('id') id: string,
    @Body() dto: AddPantoneColorDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.addPantoneColor(id, dto, user.id);
  }

  @Delete(':id/pantone-colors/:colorId')
  @ApiOperation({ summary: 'Remove pantone color from work order' })
  removePantoneColor(
    @Param('id') id: string,
    @Param('colorId') colorId: string,
  ) {
    return this.service.removePantoneColor(id, colorId);
  }

  // ── Logs ──

  @Get(':id/logs')
  @ApiOperation({ summary: 'List logs for work order' })
  findLogs(@Param('id') id: string) {
    return this.service.findLogs(id);
  }

  @Post(':id/logs')
  @ApiOperation({ summary: 'Create log entry' })
  createLog(
    @Param('id') id: string,
    @Body() dto: CreateWorkOrderLogDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.createLog(id, dto, user.id);
  }
}
