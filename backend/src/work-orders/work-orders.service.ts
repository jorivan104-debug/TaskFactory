import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlueprintEngineService } from './blueprint-engine.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AddPantoneColorDto } from './dto/add-pantone-color.dto';
import { CreateWorkOrderLogDto } from './dto/create-work-order-log.dto';
import type { BlueprintDefinition } from '../work-order-types/blueprint-validator';

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: BlueprintEngineService,
  ) {}

  findAll(filters: { productionOrderId?: string; status?: string; workSiteId?: string }) {
    const where: Record<string, unknown> = {};
    if (filters.productionOrderId) where.productionOrderId = filters.productionOrderId;
    if (filters.status) where.status = filters.status;
    if (filters.workSiteId) where.workSiteId = filters.workSiteId;

    return this.prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workOrderType: { select: { id: true, code: true, name: true } },
        productionOrder: { select: { id: true, code: true } },
        workSite: { select: { id: true, code: true, name: true } },
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
      },
    });
    if (!item) throw new NotFoundException('Work order not found');
    return item;
  }

  async create(dto: CreateWorkOrderDto, userId: string) {
    const { workOrderTypeId, ...rest } = dto;

    const wo = await this.prisma.workOrder.create({
      data: {
        ...rest,
        status: dto.status ?? 'pending',
        workOrderTypeId: workOrderTypeId ?? null,
        createdByUserId: userId,
      },
    });

    if (workOrderTypeId) {
      const blueprint = await this.prisma.workOrderBlueprint.findUnique({
        where: { workOrderTypeId },
      });
      if (blueprint && blueprint.status === 'published') {
        const def = blueprint.definitionJson as unknown as BlueprintDefinition;
        await this.engine.initializeFromBlueprint(wo.id, def, blueprint.version);
      }
    }

    return this.findOne(wo.id);
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(id);
    return this.prisma.workOrder.update({ where: { id }, data: dto as any });
  }

  async getFlow(id: string) {
    return this.engine.getRuntimeContext(id);
  }

  async executeTransition(id: string, transitionId: string, userId: string) {
    await this.engine.executeTransition(id, transitionId, userId);
    return this.getFlow(id);
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
        performedByUserId: userId,
      },
    });
  }
}
