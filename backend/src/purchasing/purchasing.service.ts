// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

@Injectable()
export class PurchasingService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Purchase Orders ──

  findOrders() {
    return this.prisma.supplyPurchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async findOrder(id: string) {
    const item = await this.prisma.supplyPurchaseOrder.findUnique({
      where: { id },
      include: { items: true, receipts: { include: { items: true } } },
    });
    if (!item) throw new NotFoundException('Purchase order not found');
    return item;
  }

  createOrder(dto: CreatePurchaseOrderDto, userId: string) {
    return this.prisma.supplyPurchaseOrder.create({
      data: {
        ...dto,
        expectedDeliveryAt: dto.expectedDeliveryAt ? new Date(dto.expectedDeliveryAt) : undefined,
        createdByUserId: userId,
      },
    });
  }

  async updateOrder(id: string, dto: UpdatePurchaseOrderDto) {
    await this.findOrder(id);
    return this.prisma.supplyPurchaseOrder.update({
      where: { id },
      data: {
        ...dto,
        expectedDeliveryAt: dto.expectedDeliveryAt ? new Date(dto.expectedDeliveryAt) : undefined,
      },
    });
  }

  // ── Order Items ──

  findOrderItems(orderId: string) {
    return this.prisma.supplyPurchaseOrderItem.findMany({
      where: { purchaseOrderId: orderId },
    });
  }

  async createOrderItem(orderId: string, dto: CreatePurchaseOrderItemDto, userId: string) {
    await this.findOrder(orderId);
    return this.prisma.supplyPurchaseOrderItem.create({
      data: { ...dto, purchaseOrderId: orderId, createdByUserId: userId },
    });
  }

  async updateOrderItem(orderId: string, itemId: string, dto: UpdatePurchaseOrderItemDto) {
    await this.findOrder(orderId);
    return this.prisma.supplyPurchaseOrderItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async deleteOrderItem(orderId: string, itemId: string) {
    await this.findOrder(orderId);
    return this.prisma.supplyPurchaseOrderItem.delete({
      where: { id: itemId },
    });
  }

  // ── Receipts ──

  async createReceipt(orderId: string, dto: CreateReceiptDto, userId: string) {
    await this.findOrder(orderId);
    return this.prisma.supplyReceipt.create({
      data: {
        purchaseOrderId: orderId,
        warehouseId: dto.warehouseId,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : new Date(),
        notes: dto.notes,
        receivedByUserId: userId,
        items: {
          create: dto.items.map((item) => ({
            purchaseOrderItemId: item.purchaseOrderItemId,
            quantityReceived: item.quantityReceived,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });
  }

  // ── Invoices ──

  findInvoices() {
    return this.prisma.supplierInvoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findInvoice(id: string) {
    const item = await this.prisma.supplierInvoice.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Invoice not found');
    return item;
  }

  createInvoice(dto: CreateSupplierInvoiceDto, userId: string) {
    return this.prisma.supplierInvoice.create({
      data: {
        ...dto,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        createdByUserId: userId,
      },
    });
  }

  async updateInvoice(id: string, dto: UpdateSupplierInvoiceDto) {
    await this.findInvoice(id);
    return this.prisma.supplierInvoice.update({
      where: { id },
      data: {
        ...dto,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
    });
  }

  // ── Payments ──

  findPayments() {
    return this.prisma.supplierPayment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPayment(id: string) {
    const item = await this.prisma.supplierPayment.findUnique({
      where: { id },
      include: { allocations: true },
    });
    if (!item) throw new NotFoundException('Payment not found');
    return item;
  }

  createPayment(dto: CreateSupplierPaymentDto, userId: string) {
    return this.prisma.supplierPayment.create({
      data: {
        ...dto,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        createdByUserId: userId,
      },
    });
  }

  async updatePayment(id: string, dto: UpdateSupplierPaymentDto) {
    await this.findPayment(id);
    return this.prisma.supplierPayment.update({
      where: { id },
      data: {
        ...dto,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
    });
  }

  // ── Payment Allocations ──

  async createAllocation(paymentId: string, dto: CreatePaymentAllocationDto, userId: string) {
    await this.findPayment(paymentId);
    return this.prisma.paymentAllocation.create({
      data: {
        ...dto,
        paymentId,
        createdByUserId: userId,
      },
    });
  }
}
