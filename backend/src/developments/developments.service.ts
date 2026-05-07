import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDevelopmentDto } from './dto/create-development.dto';
import { UpdateDevelopmentDto } from './dto/update-development.dto';

@Injectable()
export class DevelopmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.development.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.development.findUnique({
      where: { id },
      include: { productionOrders: true },
    });
    if (!item) throw new NotFoundException('Development not found');
    return item;
  }

  create(dto: CreateDevelopmentDto, userId: string) {
    return this.prisma.development.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateDevelopmentDto) {
    await this.findOne(id);
    return this.prisma.development.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.development.update({
      where: { id },
      data: { status },
    });
  }
}
