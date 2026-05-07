// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkSiteDto } from './dto/create-work-site.dto';
import { UpdateWorkSiteDto } from './dto/update-work-site.dto';

@Injectable()
export class WorkSitesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.workSite.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.workSite.findUnique({
      where: { id },
      include: { warehouses: true },
    });
    if (!item) throw new NotFoundException('Work site not found');
    return item;
  }

  create(dto: CreateWorkSiteDto, userId: string) {
    return this.prisma.workSite.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateWorkSiteDto) {
    await this.findOne(id);
    return this.prisma.workSite.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.workSite.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
