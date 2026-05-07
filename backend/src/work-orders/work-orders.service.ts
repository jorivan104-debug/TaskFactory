import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AddPantoneColorDto } from './dto/add-pantone-color.dto';
import { CreateWorkOrderLogDto } from './dto/create-work-order-log.dto';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { productionOrderId?: string; status?: string; workSiteId?: string }) {
    const where: any = {};
    if (filters.productionOrderId) where.productionOrderId = filters.productionOrderId;
    if (filters.status) where.status = filters.status;
    if (filters.workSiteId) where.workSiteId = filters.workSiteId;

    return this.prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        logs: { orderBy: { createdAt: 'desc' } },
        pantoneColors: true,
        taskAssignments: true,
      },
    });
    if (!item) throw new NotFoundException('Work order not found');
    return item;
  }

  create(dto: CreateWorkOrderDto, userId: string) {
    return this.prisma.workOrder.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(id);
    return this.prisma.workOrder.update({ where: { id }, data: dto });
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
