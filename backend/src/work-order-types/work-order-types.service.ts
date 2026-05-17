import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderTypeDto } from './dto/create-work-order-type.dto';
import { UpdateWorkOrderTypeDto } from './dto/update-work-order-type.dto';
import { SaveBlueprintDto } from './dto/save-blueprint.dto';
import { validateBlueprintDefinition } from './blueprint-validator';

@Injectable()
export class WorkOrderTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.workOrderType.findMany({
      orderBy: { name: 'asc' },
      include: { blueprint: { select: { id: true, version: true, status: true, publishedAt: true } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.workOrderType.findUnique({
      where: { id },
      include: { blueprint: true },
    });
    if (!item) throw new NotFoundException('Work order type not found');
    return item;
  }

  async create(dto: CreateWorkOrderTypeDto, userId: string) {
    const existing = await this.prisma.workOrderType.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Code "${dto.code}" already exists`);
    return this.prisma.workOrderType.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateWorkOrderTypeDto) {
    await this.findOne(id);
    return this.prisma.workOrderType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const refs = await this.prisma.workOrder.count({ where: { workOrderTypeId: id } });
    if (refs > 0) throw new ConflictException('Cannot delete a type with existing work orders');
    await this.prisma.workOrderBlueprint.deleteMany({ where: { workOrderTypeId: id } });
    return this.prisma.workOrderType.delete({ where: { id } });
  }

  // ─── Blueprint ───

  async getBlueprint(workOrderTypeId: string, includeDraft: boolean) {
    const type = await this.findOne(workOrderTypeId);
    if (!type.blueprint) return null;
    if (!includeDraft && type.blueprint.status !== 'published') return null;
    return type.blueprint;
  }

  async saveBlueprint(workOrderTypeId: string, dto: SaveBlueprintDto, userId: string) {
    await this.findOne(workOrderTypeId);

    const existing = await this.prisma.workOrderBlueprint.findUnique({
      where: { workOrderTypeId },
    });

    if (existing) {
      return this.prisma.workOrderBlueprint.update({
        where: { id: existing.id },
        data: {
          definitionJson: dto.definitionJson as any,
          status: 'draft',
          publishedAt: null,
        },
      });
    }

    return this.prisma.workOrderBlueprint.create({
      data: {
        workOrderTypeId,
        definitionJson: dto.definitionJson as any,
        status: 'draft',
        createdByUserId: userId,
      },
    });
  }

  async publishBlueprint(workOrderTypeId: string) {
    const type = await this.findOne(workOrderTypeId);
    if (!type.blueprint) {
      throw new BadRequestException('No blueprint draft to publish');
    }

    const errors = validateBlueprintDefinition(type.blueprint.definitionJson);
    if (errors.length > 0) {
      throw new BadRequestException({ message: 'Blueprint validation failed', errors });
    }

    return this.prisma.workOrderBlueprint.update({
      where: { id: type.blueprint.id },
      data: {
        status: 'published',
        version: { increment: 1 },
        publishedAt: new Date(),
      },
    });
  }
}
