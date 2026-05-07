// @ts-nocheck

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { CreateShipmentItemDto } from './dto/create-shipment-item.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
};

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.shipment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.shipment.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!item) throw new NotFoundException('Shipment not found');
    return item;
  }

  create(dto: CreateShipmentDto, userId: string) {
    return this.prisma.shipment.create({
      data: {
        ...dto,
        estimatedDeliveryAt: dto.estimatedDeliveryAt ? new Date(dto.estimatedDeliveryAt) : undefined,
        createdByUserId: userId,
      },
    });
  }

  async update(id: string, dto: UpdateShipmentDto) {
    const shipment = await this.findOne(id);

    if (dto.status && dto.status !== shipment.status) {
      const allowed = VALID_TRANSITIONS[shipment.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from '${shipment.status}' to '${dto.status}'`,
        );
      }
    }

    return this.prisma.shipment.update({
      where: { id },
      data: {
        ...dto,
        estimatedDeliveryAt: dto.estimatedDeliveryAt ? new Date(dto.estimatedDeliveryAt) : undefined,
        deliveredAt: dto.status === 'delivered' ? new Date() : undefined,
      },
    });
  }

  // ── Items ──

  async addItem(shipmentId: string, dto: CreateShipmentItemDto, userId: string) {
    await this.findOne(shipmentId);
    return this.prisma.shipmentItem.create({
      data: { ...dto, shipmentId, createdByUserId: userId },
    });
  }

  async removeItem(shipmentId: string, itemId: string) {
    await this.findOne(shipmentId);
    return this.prisma.shipmentItem.delete({ where: { id: itemId } });
  }
}
