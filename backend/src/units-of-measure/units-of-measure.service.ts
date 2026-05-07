import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitOfMeasureDto } from './dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from './dto/update-unit-of-measure.dto';

@Injectable()
export class UnitsOfMeasureService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.unitOfMeasure.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.unitOfMeasure.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Unit of measure not found');
    return item;
  }

  create(dto: CreateUnitOfMeasureDto) {
    return this.prisma.unitOfMeasure.create({ data: dto });
  }

  async update(id: string, dto: UpdateUnitOfMeasureDto) {
    await this.findOne(id);
    return this.prisma.unitOfMeasure.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.unitOfMeasure.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
