import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters?: { supplierType?: string; isActive?: boolean }) {
    const where: Record<string, unknown> = {};
    if (filters?.supplierType) where.supplierType = filters.supplierType;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.supplier.findMany({
      where,
      orderBy: { legalName: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.supplier.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Proveedor no encontrado');
    return item;
  }

  create(dto: CreateSupplierDto, userId: string) {
    return this.prisma.supplier.create({
      data: {
        legalName: dto.legalName,
        tradeName: dto.tradeName,
        supplierType: dto.supplierType,
        contactPerson: dto.contactPerson,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        taxId: dto.taxId,
        notes: dto.notes,
        createdByUserId: userId,
      },
    });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
