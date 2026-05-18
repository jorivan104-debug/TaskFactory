import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { InventoryService } from './inventory.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { CreateSupplyWithInventoryDto } from './dto/create-supply-with-inventory.dto';
import { UpdateSupplyPriceDto } from './dto/update-supply-price.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('items')
  @ApiOperation({ summary: 'List inventory items (supplies with stock)' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'supplyTypeId', required: false })
  @ApiQuery({ name: 'disponible', required: false })
  @ApiQuery({ name: 'faltante', required: false })
  findItems(
    @Query('warehouseId') warehouseId?: string,
    @Query('isActive') isActive?: string,
    @Query('supplyTypeId') supplyTypeId?: string,
    @Query('disponible') disponible?: string,
    @Query('faltante') faltante?: string,
  ) {
    return this.service.findSupplyItems({
      warehouseId,
      isActive: isActive === undefined ? undefined : isActive === 'true',
      supplyTypeId,
      disponible: disponible === undefined ? undefined : disponible === 'true',
      faltante: faltante === undefined ? undefined : faltante === 'true',
    });
  }

  @Get('items/:supplyId')
  @ApiOperation({ summary: 'Get supply inventory detail' })
  findItem(@Param('supplyId') supplyId: string) {
    return this.service.findSupplyItem(supplyId);
  }

  @Patch('items/:supplyId')
  @ApiOperation({ summary: 'Update supply purchase unit price' })
  updateSupplyPrice(
    @Param('supplyId') supplyId: string,
    @Body() dto: UpdateSupplyPriceDto,
  ) {
    return this.service.updateSupplyPrice(supplyId, dto.purchaseUnitPrice);
  }

  @Get('items/:supplyId/movements')
  @ApiOperation({ summary: 'List movements for a supply' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  findSupplyMovements(
    @Param('supplyId') supplyId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findMovements({
      supplyId,
      warehouseId,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Post('supplies')
  @ApiOperation({ summary: 'Register new supply (optional initial stock adjustment)' })
  createSupply(
    @Body() dto: CreateSupplyWithInventoryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.createSupplyWithInventory(dto, user.id);
  }

  @Get('movements')
  @ApiOperation({ summary: 'List inventory movements' })
  @ApiQuery({ name: 'supplyId', required: false })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'movementType', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  findMovements(
    @Query('supplyId') supplyId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('movementType') movementType?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findMovements({
      supplyId,
      warehouseId,
      movementType,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get('movements/:id')
  @ApiOperation({ summary: 'Get movement by id' })
  findMovement(@Param('id') id: string) {
    return this.service.findMovement(id);
  }

  @Post('movements')
  @ApiOperation({ summary: 'Create inventory movement (adjustment, in/out)' })
  createMovement(@Body() dto: CreateMovementDto, @CurrentUser() user: { id: string }) {
    return this.service.createMovement(dto, user.id);
  }

  @Patch('movements/:id')
  @ApiOperation({ summary: 'Update inventory movement' })
  updateMovement(@Param('id') id: string, @Body() dto: UpdateMovementDto) {
    return this.service.updateMovement(id, dto);
  }

  @Post('movements/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate movement and reverse stock' })
  deactivateMovement(@Param('id') id: string) {
    return this.service.deactivateMovement(id);
  }

  @Delete('movements/:id')
  @ApiOperation({ summary: 'Delete deactivated movement' })
  removeMovement(@Param('id') id: string) {
    return this.service.removeMovement(id);
  }
}
