import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
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
  @ApiQuery({ name: 'productionOrderId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'workSiteId', required: false })
  findAll(
    @Query('productionOrderId') productionOrderId?: string,
    @Query('status') status?: string,
    @Query('workSiteId') workSiteId?: string,
  ) {
    return this.service.findAll({ productionOrderId, status, workSiteId });
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
