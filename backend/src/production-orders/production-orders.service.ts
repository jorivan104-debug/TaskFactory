import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { CreateGarmentReferenceDto } from './dto/create-garment-reference.dto';
import { UpdateGarmentReferenceDto } from './dto/update-garment-reference.dto';
import { UpsertSizeCurveDto } from './dto/upsert-size-curve.dto';

@Injectable()
export class ProductionOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { status?: string; workSiteId?: string; productionType?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.workSiteId) where.workSiteId = filters.workSiteId;
    if (filters.productionType) where.productionType = filters.productionType;

    return this.prisma.productionOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.productionOrder.findUnique({
      where: { id },
      include: {
        garmentReference: true,
        workOrders: true,
        sizeCurveItems: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!item) throw new NotFoundException('Production order not found');
    return item;
  }

  create(dto: CreateProductionOrderDto, userId: string) {
    return this.prisma.productionOrder.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateProductionOrderDto) {
    await this.findOne(id);
    return this.prisma.productionOrder.update({ where: { id }, data: dto });
  }

  async close(id: string, userId: string) {
    await this.findOne(id);
    return this.prisma.productionOrder.update({
      where: { id },
      data: {
        status: 'completed',
        closedAt: new Date(),
        closedByUserId: userId,
      },
    });
  }

  // ── Garment Reference ──

  async createGarmentReference(productionOrderId: string, dto: CreateGarmentReferenceDto, userId: string) {
    await this.findOne(productionOrderId);
    return this.prisma.garmentReference.create({
      data: {
        ...dto,
        images: dto.images ?? [],
        productionOrderId,
        createdByUserId: userId,
      },
    });
  }

  async updateGarmentReference(productionOrderId: string, dto: UpdateGarmentReferenceDto) {
    const order = await this.findOne(productionOrderId);
    if (!order.garmentReference) {
      throw new NotFoundException('Garment reference not found for this order');
    }
    return this.prisma.garmentReference.update({
      where: { id: order.garmentReference.id },
      data: { ...dto, images: dto.images },
    });
  }

  // ── Size Curve ──

  async upsertSizeCurve(productionOrderId: string, dto: UpsertSizeCurveDto, userId: string) {
    await this.findOne(productionOrderId);

    await this.prisma.sizeCurveItem.deleteMany({
      where: { productionOrderId },
    });

    return this.prisma.sizeCurveItem.createMany({
      data: dto.items.map((item) => ({
        ...item,
        productionOrderId,
        createdByUserId: userId,
      })),
    });
  }
}
