import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Stock ──

  findStock(filters: { warehouseId?: string; productId?: string }) {
    const where: any = {};
    if (filters.warehouseId) where.warehouseId = filters.warehouseId;
    if (filters.productId) where.productId = filters.productId;

    return this.prisma.stockLot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Movements ──

  findMovements(filters: {
    warehouseId?: string;
    productId?: string;
    movementType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = {};
    if (filters.warehouseId) where.warehouseId = filters.warehouseId;
    if (filters.productId) where.productId = filters.productId;
    if (filters.movementType) where.movementType = filters.movementType;
    if (filters.dateFrom || filters.dateTo) {
      where.occurredAt = {};
      if (filters.dateFrom) where.occurredAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.occurredAt.lte = new Date(filters.dateTo);
    }

    return this.prisma.inventoryMovement.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
    });
  }

  createMovement(dto: CreateMovementDto, userId: string) {
    return this.prisma.inventoryMovement.create({
      data: {
        ...dto,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
        createdByUserId: userId,
      },
    });
  }

  // ── Products ──

  findProducts() {
    return this.prisma.product.findMany({ orderBy: { name: 'asc' } });
  }

  async findProduct(id: string) {
    const item = await this.prisma.product.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Product not found');
    return item;
  }

  createProduct(dto: CreateProductDto, userId: string) {
    return this.prisma.product.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.findProduct(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }
}
