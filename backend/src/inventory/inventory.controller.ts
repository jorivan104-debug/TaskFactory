import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { InventoryService } from './inventory.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  // ── Stock ──

  @Get('stock')
  @ApiOperation({ summary: 'List stock lots' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  findStock(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
  ) {
    return this.service.findStock({ warehouseId, productId });
  }

  // ── Movements ──

  @Get('movements')
  @ApiOperation({ summary: 'List inventory movements' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'movementType', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findMovements(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('movementType') movementType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.findMovements({ warehouseId, productId, movementType, dateFrom, dateTo });
  }

  @Post('movements')
  @ApiOperation({ summary: 'Create inventory movement' })
  createMovement(@Body() dto: CreateMovementDto, @CurrentUser() user: any) {
    return this.service.createMovement(dto, user.id);
  }

  // ── Products ──

  @Get('products')
  @ApiOperation({ summary: 'List products' })
  findProducts() {
    return this.service.findProducts();
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product' })
  createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.service.createProduct(dto, user.id);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.updateProduct(id, dto);
  }
}
