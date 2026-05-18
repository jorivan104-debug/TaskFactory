import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGarmentReferenceDto } from './dto/create-garment-reference.dto';
import { UpdateGarmentReferenceDto } from './dto/update-garment-reference.dto';
import {
  allocateReferenceSequence,
  allocateSerie,
  assertReferenceType,
  buildReferenceCode,
} from './garment-reference-code.util';

@Injectable()
export class GarmentReferencesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { isActive?: boolean; referenceType?: string; brandId?: string }) {
    const where: Record<string, unknown> = { workOrderId: null };
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.referenceType) where.referenceType = filters.referenceType;
    if (filters.brandId) where.brandId = filters.brandId;

    return this.prisma.garmentReference.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { id: true, name: true, consecutivo: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.garmentReference.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true, consecutivo: true } },
      },
    });
    if (!item) throw new NotFoundException('Garment reference not found');
    return item;
  }

  async previewNext(brandId: string, referenceType: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Brand not found');
    const type = assertReferenceType(referenceType);

    const serie = await allocateSerie(this.prisma, brandId, type);
    const referenceSequence = await allocateReferenceSequence(this.prisma, brandId);
    const code = buildReferenceCode(brand.consecutivo, referenceSequence, serie);

    return { code, serie, referenceSequence, brandConsecutivo: brand.consecutivo };
  }

  async create(dto: CreateGarmentReferenceDto, userId: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } });
    if (!brand) throw new NotFoundException('Brand not found');
    const referenceType = assertReferenceType(dto.referenceType);

    return this.prisma.$transaction(async (tx) => {
      const serie = await allocateSerie(tx, dto.brandId, referenceType);
      const referenceSequence = await allocateReferenceSequence(tx, dto.brandId);
      const code = buildReferenceCode(brand.consecutivo, referenceSequence, serie);

      return tx.garmentReference.create({
        data: {
          brandId: dto.brandId,
          referenceType,
          serie,
          referenceSequence,
          code,
          title: dto.title,
          imageUrl: dto.imageUrl,
          silhouetteId: dto.silhouetteId,
          fabricSupplyId: dto.fabricSupplyId,
          pantoneColorId: dto.pantoneColorId,
          status: 'active',
          isActive: true,
          createdByUserId: userId,
        },
        include: {
          brand: { select: { id: true, name: true, consecutivo: true } },
        },
      });
    });
  }

  async update(id: string, dto: UpdateGarmentReferenceDto) {
    const ref = await this.findOne(id);
    if (ref.workOrderId) {
      throw new BadRequestException(
        'Referencias vinculadas a una OT se editan desde la orden de trabajo',
      );
    }
    return this.prisma.garmentReference.update({
      where: { id },
      data: dto,
      include: {
        brand: { select: { id: true, name: true, consecutivo: true } },
      },
    });
  }

  async deactivate(id: string) {
    const ref = await this.findOne(id);
    if (ref.workOrderId) {
      throw new BadRequestException('No se puede desactivar una referencia vinculada a una OT');
    }
    return this.prisma.garmentReference.update({
      where: { id },
      data: { isActive: false },
      include: {
        brand: { select: { id: true, name: true, consecutivo: true } },
      },
    });
  }

  // ── BOM (Supply Requirements) ──

  async findSupplyRequirements(garmentReferenceId: string) {
    await this.findOne(garmentReferenceId);
    return this.prisma.garmentReferenceSupplyRequirement.findMany({
      where: { garmentReferenceId },
      orderBy: { sortOrder: 'asc' },
      include: {
        supply: {
          select: { id: true, name: true, sku: true, supplyType: { select: { name: true } }, unitOfMeasure: { select: { code: true, name: true } } },
        },
      },
    });
  }

  async upsertSupplyRequirement(
    garmentReferenceId: string,
    dto: { supplyId: string; quantityPerGarment: number; sortOrder?: number; notes?: string },
    userId: string,
  ) {
    const ref = await this.findOne(garmentReferenceId);
    if (ref.workOrderId) {
      throw new BadRequestException('BOM solo se edita en referencias de catálogo');
    }

    return this.prisma.garmentReferenceSupplyRequirement.upsert({
      where: {
        garmentReferenceId_supplyId: { garmentReferenceId, supplyId: dto.supplyId },
      },
      create: {
        garmentReferenceId,
        supplyId: dto.supplyId,
        quantityPerGarment: dto.quantityPerGarment,
        sortOrder: dto.sortOrder ?? 0,
        notes: dto.notes,
        createdByUserId: userId,
      },
      update: {
        quantityPerGarment: dto.quantityPerGarment,
        sortOrder: dto.sortOrder,
        notes: dto.notes,
      },
      include: {
        supply: {
          select: { id: true, name: true, sku: true, supplyType: { select: { name: true } }, unitOfMeasure: { select: { code: true, name: true } } },
        },
      },
    });
  }

  async removeSupplyRequirement(garmentReferenceId: string, supplyId: string) {
    const ref = await this.findOne(garmentReferenceId);
    if (ref.workOrderId) {
      throw new BadRequestException('BOM solo se edita en referencias de catálogo');
    }

    return this.prisma.garmentReferenceSupplyRequirement.delete({
      where: {
        garmentReferenceId_supplyId: { garmentReferenceId, supplyId },
      },
    });
  }

  /** Genera código/serie para referencia operativa (OT). */
  async createForWorkOrder(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    data: {
      brandId: string;
      referenceType: string;
      createdByUserId: string;
      sourceCatalogReferenceId?: string;
      title?: string;
      silhouetteId?: string;
      fabricSupplyId?: string;
      pantoneColorId?: string;
      garmentImageUrl1?: string;
      garmentImageUrl2?: string;
      garmentImageUrl3?: string;
    },
    workOrderId: string,
  ) {
    const brand = await tx.brand.findUnique({ where: { id: data.brandId } });
    if (!brand) throw new NotFoundException('Brand not found');
    const referenceType = assertReferenceType(data.referenceType);
    const serie = await allocateSerie(tx, data.brandId, referenceType);
    const referenceSequence = await allocateReferenceSequence(tx, data.brandId);
    const code = buildReferenceCode(brand.consecutivo, referenceSequence, serie);

    return tx.garmentReference.create({
      data: {
        ...data,
        workOrderId,
        referenceType,
        serie,
        referenceSequence,
        code,
        status: 'active',
        isActive: true,
      },
    });
  }
}
