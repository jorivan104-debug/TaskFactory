// @ts-nocheck

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.brand.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Brand not found');
    return item;
  }

  create(dto: CreateBrandDto, userId: string) {
    const { nextReferenceSequence, ...rest } = dto;
    return this.prisma.brand.create({
      data: {
        ...rest,
        createdByUserId: userId,
        ...(nextReferenceSequence !== undefined && {
          nextReferenceSequence: BigInt(nextReferenceSequence),
        }),
      },
    });
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    const { nextReferenceSequence, ...rest } = dto;
    return this.prisma.brand.update({
      where: { id },
      data: {
        ...rest,
        ...(nextReferenceSequence !== undefined && {
          nextReferenceSequence: BigInt(nextReferenceSequence),
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const refs = await this.prisma.garmentReference.count({ where: { brandId: id } });
    if (refs > 0) {
      throw new ConflictException('Cannot delete a brand with garment references');
    }
    return this.prisma.brand.delete({ where: { id } });
  }

  async getNextSequence(id: string) {
    const brand = await this.findOne(id);
    const seq = brand.nextReferenceSequence;
    await this.prisma.brand.update({
      where: { id },
      data: { nextReferenceSequence: { increment: 1 } },
    });
    return seq;
  }
}
