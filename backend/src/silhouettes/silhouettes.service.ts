// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSilhouetteCategoryDto } from './dto/create-silhouette-category.dto';
import { UpdateSilhouetteCategoryDto } from './dto/update-silhouette-category.dto';
import { CreateSilhouetteDto } from './dto/create-silhouette.dto';
import { UpdateSilhouetteDto } from './dto/update-silhouette.dto';

@Injectable()
export class SilhouettesService {
  constructor(private readonly prisma: PrismaService) {}

  /* ─── Categories ─── */

  findAllCategories() {
    return this.prisma.silhouetteCategory.findMany({
      orderBy: { name: 'asc' },
      include: { silhouettes: true },
    });
  }

  async findOneCategory(id: string) {
    const item = await this.prisma.silhouetteCategory.findUnique({
      where: { id },
      include: { silhouettes: true },
    });
    if (!item) throw new NotFoundException('Silhouette category not found');
    return item;
  }

  createCategory(dto: CreateSilhouetteCategoryDto) {
    return this.prisma.silhouetteCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateSilhouetteCategoryDto) {
    await this.findOneCategory(id);
    return this.prisma.silhouetteCategory.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    await this.findOneCategory(id);
    return this.prisma.silhouetteCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /* ─── Silhouettes ─── */

  findAll() {
    return this.prisma.silhouette.findMany({
      orderBy: { name: 'asc' },
      include: { silhouetteCategory: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.silhouette.findUnique({
      where: { id },
      include: { silhouetteCategory: true },
    });
    if (!item) throw new NotFoundException('Silhouette not found');
    return item;
  }

  create(dto: CreateSilhouetteDto) {
    return this.prisma.silhouette.create({ data: dto });
  }

  async update(id: string, dto: UpdateSilhouetteDto) {
    await this.findOne(id);
    return this.prisma.silhouette.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.silhouette.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
