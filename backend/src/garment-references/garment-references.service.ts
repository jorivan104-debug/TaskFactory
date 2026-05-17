import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGarmentReferenceCatalogDto } from './dto/update-garment-reference-catalog.dto';

@Injectable()
export class GarmentReferencesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllCatalog(filters: { status?: string }) {
    const where: Record<string, unknown> = { source: 'lexi_catalog' };
    if (filters.status) where.status = filters.status;

    return this.prisma.garmentReference.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.garmentReference.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Garment reference not found');
    return item;
  }

  async updateCatalog(id: string, dto: UpdateGarmentReferenceCatalogDto) {
    const ref = await this.findOne(id);
    if (ref.source !== 'lexi_catalog') {
      throw new NotFoundException('Only catalog references can be updated here');
    }
    return this.prisma.garmentReference.update({
      where: { id },
      data: dto,
    });
  }
}
