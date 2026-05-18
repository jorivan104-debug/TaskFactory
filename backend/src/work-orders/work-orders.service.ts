import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlueprintEngineService } from './blueprint-engine.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpsertGarmentReferenceDto } from './dto/upsert-garment-reference.dto';
import { UpsertSizeCurveDto } from './dto/upsert-size-curve.dto';
import { AddPantoneColorDto } from './dto/add-pantone-color.dto';
import { CreateWorkOrderLogDto } from './dto/create-work-order-log.dto';
import type { BlueprintDefinition } from '../work-order-types/blueprint-validator';
import { GarmentReferencesService } from '../garment-references/garment-references.service';

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: BlueprintEngineService,
    private readonly garmentRefs: GarmentReferencesService,
  ) {}

  findAll(filters: { status?: string; workSiteId?: string; productionType?: string }) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.workSiteId) where.workSiteId = filters.workSiteId;
    if (filters.productionType) where.productionType = filters.productionType;

    return this.prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workOrderType: { select: { id: true, code: true, name: true } },
        workSite: { select: { id: true, code: true, name: true } },
        garmentReference: {
          select: {
            id: true,
            code: true,
            serie: true,
            referenceType: true,
            title: true,
            brandId: true,
            silhouetteId: true,
            brand: { select: { id: true, name: true, consecutivo: true } },
          },
        },
        urgency: true,
        supplyCostTotal: true,
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        logs: { orderBy: { createdAt: 'desc' } },
        pantoneColors: true,
        taskAssignments: true,
        workOrderType: true,
        workSite: true,
        garmentReference: {
          include: {
            brand: { select: { id: true, name: true, consecutivo: true } },
            silhouette: { select: { id: true, name: true } },
          },
        },
        sizeCurve: {
          orderBy: { sortOrder: 'asc' },
          include: { size: { select: { id: true, name: true } } },
        },
        supplyItems: {
          include: {
            supply: {
              select: {
                id: true,
                name: true,
                sku: true,
                purchaseUnitPrice: true,
                supplyType: { select: { name: true } },
                unitOfMeasure: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Work order not found');
    return item;
  }

  async create(dto: CreateWorkOrderDto, userId: string) {
    const { workOrderTypeId, garmentReference, sizeCurve, catalogGarmentReferenceId, ...rest } = dto;

    if (!workOrderTypeId) {
      throw new BadRequestException('workOrderTypeId es obligatorio (blueprint requerido)');
    }
    const blueprint = await this.prisma.workOrderBlueprint.findUnique({
      where: { workOrderTypeId },
    });
    if (!blueprint || blueprint.status !== 'published') {
      throw new BadRequestException('El tipo de OT seleccionado no tiene un blueprint publicado');
    }

    return this.prisma.$transaction(async (tx) => {
      const wo = await tx.workOrder.create({
        data: {
          ...rest,
          status: dto.status ?? 'pending',
          urgency: dto.urgency ?? 'normal',
          workOrderTypeId,
          createdByUserId: userId,
        },
      });

      let refData = garmentReference;
      if (catalogGarmentReferenceId && !garmentReference) {
        const catalog = await tx.garmentReference.findUnique({
          where: { id: catalogGarmentReferenceId },
        });
        if (!catalog || catalog.workOrderId) {
          throw new BadRequestException('Referencia de catálogo inválida');
        }
        refData = {
          brandId: catalog.brandId,
          referenceType: catalog.referenceType,
          silhouetteId: catalog.silhouetteId ?? undefined,
          fabricSupplyId: catalog.fabricSupplyId ?? undefined,
          pantoneColorId: catalog.pantoneColorId ?? undefined,
          garmentImageUrl1: catalog.garmentImageUrl1 ?? undefined,
          garmentImageUrl2: catalog.garmentImageUrl2 ?? undefined,
          garmentImageUrl3: catalog.garmentImageUrl3 ?? undefined,
        };
      }

      if (refData) {
        const { referenceType, brandId, ...refRest } = refData;
        const createdRef = await this.garmentRefs.createForWorkOrder(
          tx,
          {
            brandId,
            referenceType,
            createdByUserId: userId,
            sourceCatalogReferenceId: catalogGarmentReferenceId,
            ...refRest,
          },
          wo.id,
        );

        // Copy BOM from catalog
        if (catalogGarmentReferenceId) {
          await this.copyBomToWorkOrder(tx, wo.id, catalogGarmentReferenceId, createdRef.fabricSupplyId, userId);
          await tx.workOrder.update({
            where: { id: wo.id },
            data: { catalogBomCopiedAt: new Date() },
          });
        }
      }

      if (sizeCurve?.length) {
        await tx.workOrderSizeCurveItem.createMany({
          data: sizeCurve.map((item) => ({
            workOrderId: wo.id,
            sizeId: item.sizeId,
            programmedQty: item.programmedQty,
            cutQty: item.cutQty ?? 0,
            sortOrder: item.sortOrder ?? 0,
            createdByUserId: userId,
            updatedAt: new Date(),
          })),
        });
        await this.syncSizeCurveTotals(wo.id, tx);
      }

      const def = blueprint.definitionJson as unknown as BlueprintDefinition;
      await this.engine.initializeFromBlueprint(wo.id, def, blueprint.version, tx);

      // Recalculate required_qty for supply items
      await this.recalculateRequiredQty(wo.id, tx);
      await this.recalculateWorkOrderCost(wo.id, tx);

      return tx.workOrder.findUnique({
        where: { id: wo.id },
        include: {
          workOrderType: true,
          workSite: true,
          garmentReference: true,
          sizeCurve: { orderBy: { sortOrder: 'asc' } },
          supplyItems: { include: { supply: { select: { id: true, name: true } } } },
          logs: { orderBy: { createdAt: 'desc' } },
          pantoneColors: true,
          taskAssignments: true,
        },
      });
    });
  }

  private async copyBomToWorkOrder(
    tx: any,
    workOrderId: string,
    catalogRefId: string,
    fabricSupplyId: string | null | undefined,
    userId: string,
  ) {
    const requirements = await tx.garmentReferenceSupplyRequirement.findMany({
      where: { garmentReferenceId: catalogRefId },
    });

    const supplyIds = new Set(requirements.map((r: any) => r.supplyId as string));

    // Include fabric as BOM line if not already present
    if (fabricSupplyId && !supplyIds.has(fabricSupplyId)) {
      requirements.push({
        id: null,
        supplyId: fabricSupplyId,
        quantityPerGarment: 1,
        garmentReferenceId: catalogRefId,
      });
    }

    if (requirements.length === 0) return;

    await tx.workOrderSupplyItem.createMany({
      data: requirements.map((r: any) => ({
        workOrderId,
        supplyId: r.supplyId,
        quantityPerGarment: Number(r.quantityPerGarment),
        unitCost: Number(r.unitCost ?? 0),
        requiredQty: 0,
        stagedQty: 0,
        executedQty: 0,
        sourceRequirementId: r.id ?? undefined,
        createdByUserId: userId,
        updatedAt: new Date(),
      })),
    });
  }

  private async recalculateWorkOrderCost(workOrderId: string, tx?: any) {
    const db = tx ?? this.prisma;
    const items = await db.workOrderSupplyItem.findMany({ where: { workOrderId } });
    const total = items.reduce(
      (sum: number, i: { requiredQty: unknown; unitCost: unknown; quantityPerGarment: unknown }) => {
        const qty = Number(i.requiredQty) > 0 ? Number(i.requiredQty) : Number(i.quantityPerGarment);
        return sum + qty * Number(i.unitCost ?? 0);
      },
      0,
    );
    await db.workOrder.update({
      where: { id: workOrderId },
      data: { supplyCostTotal: total },
    });
    return total;
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(id);
    return this.prisma.workOrder.update({ where: { id }, data: dto as any });
  }

  async close(id: string, userId: string) {
    await this.findOne(id);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        status: 'completed',
        closedAt: new Date(),
        closedByUserId: userId,
      },
    });
  }

  async getFlow(id: string) {
    return this.engine.getRuntimeContext(id);
  }

  async executeTransition(id: string, transitionId: string, userId: string) {
    await this.engine.executeTransition(id, transitionId, userId);
    return this.getFlow(id);
  }

  // ── Garment Reference ──

  async upsertGarmentReference(workOrderId: string, dto: UpsertGarmentReferenceDto, userId: string) {
    await this.findOne(workOrderId);
    const existing = await this.prisma.garmentReference.findUnique({
      where: { workOrderId },
    });

    if (existing) {
      const { brandId: _b, referenceType: _t, ...mutable } = dto as Record<string, unknown>;
      return this.prisma.garmentReference.update({
        where: { id: existing.id },
        data: mutable,
      });
    }

    if (!dto.brandId || !dto.referenceType) {
      throw new BadRequestException('brandId and referenceType are required to create a reference');
    }

    return this.prisma.$transaction((tx) =>
      this.garmentRefs.createForWorkOrder(
        tx,
        {
          brandId: dto.brandId!,
          referenceType: dto.referenceType!,
          createdByUserId: userId,
          silhouetteId: dto.silhouetteId,
          fabricSupplyId: dto.fabricSupplyId,
          pantoneColorId: dto.pantoneColorId,
          garmentImageUrl1: dto.garmentImageUrl1,
          garmentImageUrl2: dto.garmentImageUrl2,
          garmentImageUrl3: dto.garmentImageUrl3,
        },
        workOrderId,
      ),
    );
  }

  // ── Size Curve ──

  async upsertSizeCurve(workOrderId: string, dto: UpsertSizeCurveDto, userId: string) {
    await this.findOne(workOrderId);

    await this.prisma.$transaction(async (tx) => {
      await tx.workOrderSizeCurveItem.deleteMany({ where: { workOrderId } });
      await tx.workOrderSizeCurveItem.createMany({
        data: dto.items.map((item) => ({
          workOrderId,
          sizeId: item.sizeId,
          programmedQty: item.programmedQty,
          cutQty: item.cutQty ?? 0,
          sortOrder: item.sortOrder ?? 0,
          createdByUserId: userId,
          updatedAt: new Date(),
        })),
      });
      await this.syncSizeCurveTotals(workOrderId, tx);
      await this.recalculateRequiredQty(workOrderId, tx);
      await this.recalculateWorkOrderCost(workOrderId, tx);
    });

    return this.prisma.workOrderSizeCurveItem.findMany({
      where: { workOrderId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async syncSizeCurveTotals(workOrderId: string, tx?: any) {
    const db = tx ?? this.prisma;
    const items = await db.workOrderSizeCurveItem.findMany({ where: { workOrderId } });
    const totalSizesCount = items.length;
    const programmedGarmentsQty = items.reduce(
      (sum: number, i: { programmedQty: number }) => sum + i.programmedQty,
      0,
    );
    const cutGarmentsQty = items.reduce(
      (sum: number, i: { cutQty: number }) => sum + i.cutQty,
      0,
    );

    const ref = await db.garmentReference.findUnique({ where: { workOrderId } });
    if (ref) {
      await db.garmentReference.update({
        where: { id: ref.id },
        data: { totalSizesCount, programmedGarmentsQty, cutGarmentsQty },
      });
    }
  }

  async recalculateRequiredQty(workOrderId: string, tx?: any) {
    const db = tx ?? this.prisma;
    const ref = await db.garmentReference.findUnique({ where: { workOrderId } });
    if (!ref) return;

    const cutTotal = ref.cutGarmentsQty ?? 0;
    const programmedTotal = ref.programmedGarmentsQty ?? 0;
    const multiplier = cutTotal > 0 ? cutTotal : programmedTotal;

    const items = await db.workOrderSupplyItem.findMany({ where: { workOrderId } });
    for (const item of items) {
      const requiredQty = Number(item.quantityPerGarment) * multiplier;
      await db.workOrderSupplyItem.update({
        where: { id: item.id },
        data: { requiredQty },
      });
    }
    await this.recalculateWorkOrderCost(workOrderId, db);
  }

  // ── Supply Items ──

  async findSupplyItems(workOrderId: string) {
    await this.findOne(workOrderId);
    return this.prisma.workOrderSupplyItem.findMany({
      where: { workOrderId },
      include: {
        supply: {
          select: { id: true, name: true, sku: true, supplyType: { select: { name: true } }, unitOfMeasure: { select: { code: true, name: true } } },
        },
      },
    });
  }

  async upsertSupplyItem(
    workOrderId: string,
    dto: { supplyId: string; quantityPerGarment: number; unitCost?: number; notes?: string },
    userId: string,
  ) {
    const wo = await this.findOne(workOrderId);
    const ref = await this.prisma.garmentReference.findUnique({ where: { workOrderId } });
    const cutTotal = ref?.cutGarmentsQty ?? 0;
    const programmedTotal = ref?.programmedGarmentsQty ?? 0;
    const multiplier = cutTotal > 0 ? cutTotal : programmedTotal;
    const requiredQty = dto.quantityPerGarment * multiplier;

    const row = await this.prisma.workOrderSupplyItem.upsert({
      where: { workOrderId_supplyId: { workOrderId, supplyId: dto.supplyId } },
      create: {
        workOrderId,
        supplyId: dto.supplyId,
        quantityPerGarment: dto.quantityPerGarment,
        unitCost: dto.unitCost ?? 0,
        requiredQty,
        notes: dto.notes,
        createdByUserId: userId,
      },
      update: {
        quantityPerGarment: dto.quantityPerGarment,
        unitCost: dto.unitCost ?? undefined,
        requiredQty,
        notes: dto.notes,
      },
      include: {
        supply: {
          select: { id: true, name: true, sku: true, supplyType: { select: { name: true } }, unitOfMeasure: { select: { code: true, name: true } } },
        },
      },
    });
    await this.recalculateWorkOrderCost(workOrderId);
    return row;
  }

  async removeSupplyItem(workOrderId: string, supplyId: string) {
    await this.findOne(workOrderId);
    const item = await this.prisma.workOrderSupplyItem.findUnique({
      where: { workOrderId_supplyId: { workOrderId, supplyId } },
    });
    if (!item) throw new NotFoundException('Supply item not found');
    if (Number(item.stagedQty) > 0 || Number(item.executedQty) > 0) {
      throw new BadRequestException('No se puede eliminar un insumo con cantidades alistadas o ejecutadas');
    }
    const deleted = await this.prisma.workOrderSupplyItem.delete({
      where: { id: item.id },
    });
    await this.recalculateWorkOrderCost(workOrderId);
    return deleted;
  }

  // ── Pantone Colors ──

  async addPantoneColor(workOrderId: string, dto: AddPantoneColorDto, userId: string) {
    await this.findOne(workOrderId);
    return this.prisma.workOrderPantoneColor.create({
      data: { ...dto, workOrderId, createdByUserId: userId },
    });
  }

  async removePantoneColor(workOrderId: string, colorId: string) {
    await this.findOne(workOrderId);
    return this.prisma.workOrderPantoneColor.delete({
      where: { id: colorId },
    });
  }

  // ── Logs ──

  async findLogs(workOrderId: string) {
    await this.findOne(workOrderId);
    return this.prisma.workOrderLog.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLog(workOrderId: string, dto: CreateWorkOrderLogDto, userId: string) {
    await this.findOne(workOrderId);
    return this.prisma.workOrderLog.create({
      data: {
        ...dto,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : new Date(),
        workOrderId,
        createdByUserId: userId,
      },
    });
  }
}
