import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProductionOrdersService } from './production-orders.service';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { CreateGarmentReferenceDto } from './dto/create-garment-reference.dto';
import { UpdateGarmentReferenceDto } from './dto/update-garment-reference.dto';
import { UpsertSizeCurveDto } from './dto/upsert-size-curve.dto';

@ApiTags('Production Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('production-orders')
export class ProductionOrdersController {
  constructor(private readonly service: ProductionOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List production orders' })
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
  @ApiOperation({ summary: 'Get production order by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create production order' })
  create(@Body() dto: CreateProductionOrderDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update production order' })
  update(@Param('id') id: string, @Body() dto: UpdateProductionOrderDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close production order' })
  close(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.close(id, user.id);
  }

  // ── Garment Reference ──

  @Post(':id/garment-reference')
  @ApiOperation({ summary: 'Create garment reference' })
  createGarmentReference(
    @Param('id') id: string,
    @Body() dto: CreateGarmentReferenceDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createGarmentReference(id, dto, user.id);
  }

  @Patch(':id/garment-reference')
  @ApiOperation({ summary: 'Update garment reference' })
  updateGarmentReference(
    @Param('id') id: string,
    @Body() dto: UpdateGarmentReferenceDto,
  ) {
    return this.service.updateGarmentReference(id, dto);
  }

  // ── Size Curve ──

  @Post(':id/size-curve')
  @ApiOperation({ summary: 'Upsert size curve items' })
  upsertSizeCurve(
    @Param('id') id: string,
    @Body() dto: UpsertSizeCurveDto,
    @CurrentUser() user: any,
  ) {
    return this.service.upsertSizeCurve(id, dto, user.id);
  }
}
