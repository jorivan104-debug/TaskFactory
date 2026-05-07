// @ts-nocheck

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInternalOrderDto } from './dto/create-internal-order.dto';
import { UpdateInternalOrderDto } from './dto/update-internal-order.dto';
import { CreateInternalOrderItemDto } from './dto/create-internal-order-item.dto';
import { UpdateInternalOrderItemDto } from './dto/update-internal-order-item.dto';

@Injectable()
export class InternalOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.internalOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.internalOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!item) throw new NotFoundException('Internal order not found');
    return item;
  }

  create(dto: CreateInternalOrderDto, userId: string) {
    return this.prisma.internalOrder.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateInternalOrderDto) {
    await this.findOne(id);
    return this.prisma.internalOrder.update({ where: { id }, data: dto });
  }

  async approve(id: string, userId: string) {
    const order = await this.findOne(id);
    if (order.status !== 'pending_approval') {
      throw new BadRequestException('Order must be in pending_approval status to approve');
    }
    return this.prisma.internalOrder.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedByUserId: userId,
      },
    });
  }

  async convert(id: string, userId: string) {
    const order = await this.findOne(id);
    if (order.status !== 'approved') {
      throw new BadRequestException('Order must be approved before conversion');
    }
    return this.prisma.internalOrder.update({
      where: { id },
      data: {
        status: 'converted',
        convertedAt: new Date(),
        convertedByUserId: userId,
      },
    });
  }

  // ── Items ──

  async createItem(orderId: string, dto: CreateInternalOrderItemDto, userId: string) {
    await this.findOne(orderId);
    return this.prisma.internalOrderItem.create({
      data: { ...dto, internalOrderId: orderId, createdByUserId: userId },
    });
  }

  async updateItem(orderId: string, itemId: string, dto: UpdateInternalOrderItemDto) {
    await this.findOne(orderId);
    return this.prisma.internalOrderItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async deleteItem(orderId: string, itemId: string) {
    await this.findOne(orderId);
    return this.prisma.internalOrderItem.delete({ where: { id: itemId } });
  }
}
