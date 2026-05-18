import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SUPPLIER_TYPE_LABELS, SUPPLIER_TYPES } from './supplier-types';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get('types')
  @ApiOperation({ summary: 'Supplier type catalog' })
  listTypes() {
    return SUPPLIER_TYPES.map((value) => ({
      value,
      label: SUPPLIER_TYPE_LABELS[value] ?? value,
    }));
  }

  @Get()
  @ApiOperation({ summary: 'List all suppliers' })
  @ApiQuery({ name: 'supplierType', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  findAll(
    @Query('supplierType') supplierType?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll({
      supplierType,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create supplier' })
  create(@Body() dto: CreateSupplierDto, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate supplier' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
