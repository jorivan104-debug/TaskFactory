import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { InternalOrdersService } from './internal-orders.service';
import { CreateInternalOrderDto } from './dto/create-internal-order.dto';
import { UpdateInternalOrderDto } from './dto/update-internal-order.dto';
import { CreateInternalOrderItemDto } from './dto/create-internal-order-item.dto';
import { UpdateInternalOrderItemDto } from './dto/update-internal-order-item.dto';

@ApiTags('Internal Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('internal-orders')
export class InternalOrdersController {
  constructor(private readonly service: InternalOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List internal orders' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get internal order by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create internal order' })
  create(@Body() dto: CreateInternalOrderDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update internal order' })
  update(@Param('id') id: string, @Body() dto: UpdateInternalOrderDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve internal order' })
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.approve(id, user.id);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert internal order to production order' })
  convert(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.convert(id, user.id);
  }

  // ── Items ──

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to internal order' })
  createItem(
    @Param('id') id: string,
    @Body() dto: CreateInternalOrderItemDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createItem(id, dto, user.id);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Update order item' })
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateInternalOrderItemDto,
  ) {
    return this.service.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Delete order item' })
  deleteItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.deleteItem(id, itemId);
  }
}
