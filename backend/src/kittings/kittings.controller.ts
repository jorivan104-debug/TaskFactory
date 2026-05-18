import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { KittingsService } from './kittings.service';
import { CreateKittingDto } from './dto/create-kitting.dto';

@ApiTags('Kittings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-orders/:workOrderId/kittings')
export class KittingsController {
  constructor(private readonly service: KittingsService) {}

  @Get()
  @ApiOperation({ summary: 'List kittings for a work order' })
  findAll(@Param('workOrderId') workOrderId: string) {
    return this.service.findByWorkOrder(workOrderId);
  }

  @Post()
  @ApiOperation({ summary: 'Create and confirm a kitting (discounts inventory)' })
  create(
    @Param('workOrderId') workOrderId: string,
    @Body() dto: CreateKittingDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.create(workOrderId, dto, user.id);
  }

  @Post(':kittingId/in-transit')
  @ApiOperation({ summary: 'Mark kitting as in transit' })
  markInTransit(
    @Param('kittingId') kittingId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.updateStatus(kittingId, 'in_transit', user.id);
  }

  @Post(':kittingId/received')
  @ApiOperation({ summary: 'Mark kitting as received' })
  markReceived(
    @Param('kittingId') kittingId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.updateStatus(kittingId, 'received', user.id);
  }

  @Post(':kittingId/cancel')
  @ApiOperation({ summary: 'Cancel kitting (reverts inventory)' })
  cancel(
    @Param('kittingId') kittingId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.cancel(kittingId, user.id);
  }

  @Post(':kittingId/unused')
  @ApiOperation({ summary: 'Register unused material for a kitting' })
  registerUnused(
    @Param('kittingId') kittingId: string,
    @Body() body: { items: { workOrderSupplyItemId: string; quantity: number }[] },
    @CurrentUser() user: { id: string },
  ) {
    return this.service.registerUnusedMaterial(kittingId, body.items, user.id);
  }
}
