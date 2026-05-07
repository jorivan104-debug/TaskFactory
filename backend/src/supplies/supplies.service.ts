import { Injectable, NotFoundException } from '@nestjs/common';
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
        supplier: true,
        unitOfMeasure: true,
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.supply.findUnique({
      where: { id },
      include: {
        supplyType: true,
        supplier: true,
        unitOfMeasure: true,
      },
    });
    if (!item) throw new NotFoundException('Supply not found');
    return item;
  }

  create(dto: CreateSupplyDto) {
    return this.prisma.supply.create({
      data: dto,
      include: {
        supplyType: true,
        supplier: true,
        unitOfMeasure: true,
      },
    });
  }

  async update(id: string, dto: UpdateSupplyDto) {
    await this.findOne(id);
    return this.prisma.supply.update({
      where: { id },
      data: dto,
      include: {
        supplyType: true,
        supplier: true,
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
