// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplyTypeDto } from './dto/create-supply-type.dto';
import { UpdateSupplyTypeDto } from './dto/update-supply-type.dto';

@Injectable()
export class SupplyTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.supplyType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.supplyType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Supply type not found');
    return item;
  }

  create(dto: CreateSupplyTypeDto, userId: string) {
    return this.prisma.supplyType.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateSupplyTypeDto) {
    await this.findOne(id);
    return this.prisma.supplyType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supplyType.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
