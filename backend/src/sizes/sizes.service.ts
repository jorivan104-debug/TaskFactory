// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@Injectable()
export class SizesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.size.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.size.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Size not found');
    return item;
  }

  create(dto: CreateSizeDto) {
    return this.prisma.size.create({ data: dto });
  }

  async update(id: string, dto: UpdateSizeDto) {
    await this.findOne(id);
    return this.prisma.size.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.size.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
