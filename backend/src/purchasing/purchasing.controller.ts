import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PurchasingService } from './purchasing.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CreatePurchaseOrderItemDto } from './dto/create-purchase-order-item.dto';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { CreateSupplierInvoiceDto } from './dto/create-supplier-invoice.dto';
import { UpdateSupplierInvoiceDto } from './dto/update-supplier-invoice.dto';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { UpdateSupplierPaymentDto } from './dto/update-supplier-payment.dto';
import { CreatePaymentAllocationDto } from './dto/create-payment-allocation.dto';

@ApiTags('Purchasing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchasing')
export class PurchasingController {
  constructor(private readonly service: PurchasingService) {}

  // ── Purchase Orders ──

  @Get('orders')
  @ApiOperation({ summary: 'List purchase orders' })
  findOrders() {
    return this.service.findOrders();
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get purchase order by id' })
  findOrder(@Param('id') id: string) {
    return this.service.findOrder(id);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create purchase order' })
  createOrder(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
    return this.service.createOrder(dto, user.id);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update purchase order' })
  updateOrder(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.service.updateOrder(id, dto);
  }

  // ── Order Items ──

  @Get('orders/:id/items')
  @ApiOperation({ summary: 'List order items' })
  findOrderItems(@Param('id') id: string) {
    return this.service.findOrderItems(id);
  }

  @Post('orders/:id/items')
  @ApiOperation({ summary: 'Add item to order' })
  createOrderItem(
    @Param('id') id: string,
    @Body() dto: CreatePurchaseOrderItemDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createOrderItem(id, dto, user.id);
  }

  @Patch('orders/:id/items/:itemId')
  @ApiOperation({ summary: 'Update order item' })
  updateOrderItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdatePurchaseOrderItemDto,
  ) {
    return this.service.updateOrderItem(id, itemId, dto);
  }

  @Delete('orders/:id/items/:itemId')
  @ApiOperation({ summary: 'Delete order item' })
  deleteOrderItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.deleteOrderItem(id, itemId);
  }

  // ── Receipts ──

  @Post('orders/:id/receipts')
  @ApiOperation({ summary: 'Create receipt for order' })
  createReceipt(
    @Param('id') id: string,
    @Body() dto: CreateReceiptDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createReceipt(id, dto, user.id);
  }

  // ── Invoices ──

  @Get('invoices')
  @ApiOperation({ summary: 'List supplier invoices' })
  findInvoices() {
    return this.service.findInvoices();
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by id' })
  findInvoice(@Param('id') id: string) {
    return this.service.findInvoice(id);
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Create supplier invoice' })
  createInvoice(@Body() dto: CreateSupplierInvoiceDto, @CurrentUser() user: any) {
    return this.service.createInvoice(dto, user.id);
  }

  @Patch('invoices/:id')
  @ApiOperation({ summary: 'Update supplier invoice' })
  updateInvoice(@Param('id') id: string, @Body() dto: UpdateSupplierInvoiceDto) {
    return this.service.updateInvoice(id, dto);
  }

  // ── Payments ──

  @Get('payments')
  @ApiOperation({ summary: 'List supplier payments' })
  findPayments() {
    return this.service.findPayments();
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by id' })
  findPayment(@Param('id') id: string) {
    return this.service.findPayment(id);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Create supplier payment' })
  createPayment(@Body() dto: CreateSupplierPaymentDto, @CurrentUser() user: any) {
    return this.service.createPayment(dto, user.id);
  }

  @Patch('payments/:id')
  @ApiOperation({ summary: 'Update supplier payment' })
  updatePayment(@Param('id') id: string, @Body() dto: UpdateSupplierPaymentDto) {
    return this.service.updatePayment(id, dto);
  }

  // ── Payment Allocations ──

  @Post('payments/:id/allocations')
  @ApiOperation({ summary: 'Allocate payment to invoice' })
  createAllocation(
    @Param('id') id: string,
    @Body() dto: CreatePaymentAllocationDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createAllocation(id, dto, user.id);
  }
}
