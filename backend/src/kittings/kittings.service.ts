import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateKittingDto } from './dto/create-kitting.dto';
import type { BlueprintDefinition } from '../work-order-types/blueprint-validator';

@Injectable()
export class KittingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.workOrderSupplyKitting.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            workOrderSupplyItem: {
              include: { supply: { select: { id: true, name: true, unitOfMeasure: { select: { code: true } } } } },
            },
          },
        },
        sourceWarehouse: { select: { id: true, code: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
        transportedBy: { select: { id: true, fullName: true } },
        receivedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async create(workOrderId: string, dto: CreateKittingDto, userId: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException('Work order not found');
    if (!wo.blueprintSnapshotJson) {
      throw new BadRequestException('La OT no tiene blueprint; no se pueden crear alistamientos');
    }

    const def = wo.blueprintSnapshotJson as unknown as BlueprintDefinition;
    const node = def.nodes.find((n) => n.id === dto.executionStateKey);
    if (!node) {
      throw new BadRequestException(`Nodo "${dto.executionStateKey}" no existe en el blueprint`);
    }
    if (node.data?.isFinal) {
      throw new BadRequestException('No se puede asignar ejecución a un nodo final');
    }

    return this.prisma.$transaction(async (tx) => {
      const kitting = await tx.workOrderSupplyKitting.create({
        data: {
          workOrderId,
          code: dto.code,
          executionStateKey: dto.executionStateKey,
          sourceWarehouseId: dto.sourceWarehouseId,
          status: 'confirmed',
          notes: dto.notes,
          createdByUserId: userId,
        },
      });

      for (const line of dto.items) {
        const woItem = await tx.workOrderSupplyItem.findUnique({
          where: { id: line.workOrderSupplyItemId },
          include: { supply: { select: { unitOfMeasureId: true } } },
        });
        if (!woItem || woItem.workOrderId !== workOrderId) {
          throw new BadRequestException(`Supply item ${line.workOrderSupplyItemId} no pertenece a esta OT`);
        }

        await tx.workOrderSupplyKittingItem.create({
          data: {
            kittingId: kitting.id,
            workOrderSupplyItemId: line.workOrderSupplyItemId,
            quantity: line.quantity,
          },
        });

        // Increment staged_qty
        await tx.workOrderSupplyItem.update({
          where: { id: woItem.id },
          data: { stagedQty: { increment: line.quantity } },
        });

        // Discount inventory
        await tx.supply.update({
          where: { id: woItem.supplyId },
          data: { stockOnHand: { decrement: line.quantity } },
        });

        // Inventory movement
        await tx.inventoryMovement.create({
          data: {
            warehouseId: dto.sourceWarehouseId,
            supplyId: woItem.supplyId,
            movementType: 'kitting_out',
            quantity: -line.quantity,
            unitOfMeasureId: woItem.supply.unitOfMeasureId,
            referenceType: 'work_order_supply_kitting',
            referenceId: kitting.id,
            occurredAt: new Date(),
            createdByUserId: userId,
          },
        });
      }

      // Recalculate stock demand
      const supplyIds = dto.items.map((i) => i.workOrderSupplyItemId);
      const items = await tx.workOrderSupplyItem.findMany({
        where: { id: { in: supplyIds } },
        select: { supplyId: true },
      });
      const uniqueSupplyIds = [...new Set(items.map((i) => i.supplyId))];
      for (const sid of uniqueSupplyIds) {
        await this.inventory.recalculateSupplyStockDemand(sid);
      }

      return tx.workOrderSupplyKitting.findUnique({
        where: { id: kitting.id },
        include: {
          items: { include: { workOrderSupplyItem: { include: { supply: { select: { id: true, name: true } } } } } },
          sourceWarehouse: { select: { id: true, code: true, name: true } },
        },
      });
    });
  }

  async updateStatus(
    kittingId: string,
    status: 'in_transit' | 'received',
    userId: string,
  ) {
    const kitting = await this.prisma.workOrderSupplyKitting.findUnique({ where: { id: kittingId } });
    if (!kitting) throw new NotFoundException('Kitting not found');

    const data: Record<string, unknown> = { status };
    if (status === 'in_transit') {
      data.transportedByUserId = userId;
      data.transportedAt = new Date();
    } else if (status === 'received') {
      data.receivedByUserId = userId;
      data.receivedAt = new Date();
    }

    return this.prisma.workOrderSupplyKitting.update({ where: { id: kittingId }, data });
  }

  async cancel(kittingId: string, userId: string) {
    const kitting = await this.prisma.workOrderSupplyKitting.findUnique({
      where: { id: kittingId },
      include: { items: { include: { workOrderSupplyItem: { include: { supply: { select: { unitOfMeasureId: true } } } } } } },
    });
    if (!kitting) throw new NotFoundException('Kitting not found');
    if (kitting.status === 'executed') {
      throw new BadRequestException('No se puede cancelar un alistamiento ya ejecutado');
    }
    if (kitting.status === 'cancelled') {
      throw new BadRequestException('El alistamiento ya está cancelado');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of kitting.items) {
        // Revert staged_qty
        await tx.workOrderSupplyItem.update({
          where: { id: item.workOrderSupplyItemId },
          data: { stagedQty: { decrement: Number(item.quantity) } },
        });

        // Return to inventory
        const woItem = item.workOrderSupplyItem;
        await tx.supply.update({
          where: { id: woItem.supplyId },
          data: { stockOnHand: { increment: Number(item.quantity) } },
        });

        await tx.inventoryMovement.create({
          data: {
            warehouseId: kitting.sourceWarehouseId,
            supplyId: woItem.supplyId,
            movementType: 'kitting_return',
            quantity: Number(item.quantity),
            unitOfMeasureId: woItem.supply.unitOfMeasureId,
            referenceType: 'work_order_supply_kitting',
            referenceId: kitting.id,
            occurredAt: new Date(),
            createdByUserId: userId,
          },
        });
      }

      await tx.workOrderSupplyKitting.update({
        where: { id: kittingId },
        data: { status: 'cancelled' },
      });

      const uniqueSupplyIds = [...new Set(kitting.items.map((i) => i.workOrderSupplyItem.supplyId))];
      for (const sid of uniqueSupplyIds) {
        await this.inventory.recalculateSupplyStockDemand(sid);
      }

      return { cancelled: true };
    });
  }

  async registerUnusedMaterial(
    kittingId: string,
    items: { workOrderSupplyItemId: string; quantity: number }[],
    userId: string,
  ) {
    const kitting = await this.prisma.workOrderSupplyKitting.findUnique({ where: { id: kittingId } });
    if (!kitting) throw new NotFoundException('Kitting not found');
    if (kitting.status === 'executed' || kitting.status === 'cancelled') {
      throw new BadRequestException('No se puede registrar material no gastado en este estado');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.workOrderSupplyKittingUnusedItem.create({
          data: {
            kittingId,
            workOrderSupplyItemId: item.workOrderSupplyItemId,
            quantity: item.quantity,
            createdByUserId: userId,
          },
        });
      }
      return { registered: items.length };
    });
  }
}
