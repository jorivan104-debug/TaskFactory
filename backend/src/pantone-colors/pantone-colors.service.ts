// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeHexApprox } from '../common/normalize-hex';
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
    const { hexApprox, ...rest } = dto;
    return this.prisma.pantoneColor.create({
      data: {
        ...rest,
        hexApprox: normalizeHexApprox(hexApprox),
        createdByUserId: userId,
      },
    });
  }

  async update(id: string, dto: UpdatePantoneColorDto) {
    await this.findOne(id);
    const { hexApprox, ...rest } = dto;
    return this.prisma.pantoneColor.update({
      where: { id },
      data: {
        ...rest,
        ...(hexApprox !== undefined && { hexApprox: normalizeHexApprox(hexApprox) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pantoneColor.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
