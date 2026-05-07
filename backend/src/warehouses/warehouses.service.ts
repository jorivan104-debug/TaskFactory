// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.warehouse.findMany({
      orderBy: { name: 'asc' },
      include: { workSite: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { workSite: true },
    });
    if (!item) throw new NotFoundException('Warehouse not found');
    return item;
  }

  create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({ data: dto });
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOne(id);
    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.warehouse.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
