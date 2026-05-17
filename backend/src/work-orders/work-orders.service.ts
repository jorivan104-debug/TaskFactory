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

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: BlueprintEngineService,
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
          select: { id: true, brandId: true, silhouetteId: true },
        },
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
        garmentReference: true,
        sizeCurve: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!item) throw new NotFoundException('Work order not found');
    return item;
  }

  async create(dto: CreateWorkOrderDto, userId: string) {
    const { workOrderTypeId, garmentReference, sizeCurve, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      const wo = await tx.workOrder.create({
        data: {
          ...rest,
          status: dto.status ?? 'pending',
          workOrderTypeId: workOrderTypeId ?? null,
          createdByUserId: userId,
        },
      });

      if (garmentReference) {
        await tx.garmentReference.create({
          data: {
            ...garmentReference,
            workOrderId: wo.id,
            source: 'work_order',
            createdByUserId: userId,
          },
        });
      }

      if (sizeCurve?.length) {
        await tx.workOrderSizeCurveItem.createMany({
          data: sizeCurve.map((item) => ({
            workOrderId: wo.id,
            sizeId: item.sizeId,
            quantity: item.quantity,
            sortOrder: item.sortOrder ?? 0,
            createdByUserId: userId,
            updatedAt: new Date(),
          })),
        });
      }

      if (workOrderTypeId) {
        const blueprint = await tx.workOrderBlueprint.findUnique({
          where: { workOrderTypeId },
        });
        if (blueprint && blueprint.status === 'published') {
          const def = blueprint.definitionJson as unknown as BlueprintDefinition;
          await this.engine.initializeFromBlueprint(wo.id, def, blueprint.version, tx);
        }
      }

      return tx.workOrder.findUnique({
        where: { id: wo.id },
        include: {
          workOrderType: true,
          workSite: true,
          garmentReference: true,
          sizeCurve: { orderBy: { sortOrder: 'asc' } },
          logs: { orderBy: { createdAt: 'desc' } },
          pantoneColors: true,
          taskAssignments: true,
        },
      });
    });
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
      return this.prisma.garmentReference.update({
        where: { id: existing.id },
        data: dto,
      });
    }

    return this.prisma.garmentReference.create({
      data: {
        ...dto,
        workOrderId,
        source: 'work_order',
        createdByUserId: userId,
      },
    });
  }

  // ── Size Curve ──

  async upsertSizeCurve(workOrderId: string, dto: UpsertSizeCurveDto, userId: string) {
    await this.findOne(workOrderId);

    await this.prisma.workOrderSizeCurveItem.deleteMany({
      where: { workOrderId },
    });

    return this.prisma.workOrderSizeCurveItem.createMany({
      data: dto.items.map((item) => ({
        workOrderId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        sortOrder: item.sortOrder ?? 0,
        createdByUserId: userId,
        updatedAt: new Date(),
      })),
    });
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
