// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePantoneColorDto } from './dto/create-pantone-color.dto';
import { UpdatePantoneColorDto } from './dto/update-pantone-color.dto';

@Injectable()
export class PantoneColorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pantoneColor.findMany({
      orderBy: [{ pantoneSystem: 'asc' }, { pantoneCode: 'asc' }],
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.pantoneColor.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Pantone color not found');
    return item;
  }

  create(dto: CreatePantoneColorDto, userId: string) {
    return this.prisma.pantoneColor.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdatePantoneColorDto) {
    await this.findOne(id);
    return this.prisma.pantoneColor.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pantoneColor.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
