import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';

@Injectable()
export class SuppliesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.supply.findMany({
      orderBy: { name: 'asc' },
      include: {
        supplyType: true,
        defaultSupplier: true,
        unitOfMeasure: true,
        seller: { select: { id: true, fullName: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.supply.findUnique({
      where: { id },
      include: {
        supplyType: true,
        defaultSupplier: true,
        unitOfMeasure: true,
        seller: { select: { id: true, fullName: true } },
      },
    });
    if (!item) throw new NotFoundException('Supply not found');
    return item;
  }

  create(dto: CreateSupplyDto, userId: string) {
    return this.prisma.supply.create({
      data: {
        name: dto.name,
        supplyTypeId: dto.supplyTypeId,
        unitOfMeasureId: dto.unitOfMeasureId,
        defaultSupplierId: dto.defaultSupplierId,
        sku: dto.sku,
        description: dto.description,
        purchaseUnitPrice:
          dto.purchaseUnitPrice !== undefined
            ? new Prisma.Decimal(dto.purchaseUnitPrice)
            : undefined,
        sellerUserId: userId,
        createdByUserId: userId,
      },
      include: {
        supplyType: true,
        defaultSupplier: true,
        unitOfMeasure: true,
      },
    });
  }

  async update(id: string, dto: UpdateSupplyDto) {
    await this.findOne(id);
    const { purchaseUnitPrice, ...rest } = dto;
    return this.prisma.supply.update({
      where: { id },
      data: {
        ...rest,
        ...(purchaseUnitPrice !== undefined && {
          purchaseUnitPrice: new Prisma.Decimal(purchaseUnitPrice),
        }),
      },
      include: {
        supplyType: true,
        defaultSupplier: true,
        unitOfMeasure: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supply.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
