import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto, MovementType } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { CreateSupplyWithInventoryDto } from './dto/create-supply-with-inventory.dto';

const movementInclude = {
  warehouse: { select: { id: true, code: true, name: true } },
  supply: {
    select: {
      id: true,
      name: true,
      sku: true,
      supplyType: { select: { id: true, code: true, name: true } },
    },
  },
  unitOfMeasure: { select: { id: true, code: true, name: true } },
  createdBy: { select: { id: true, fullName: true } },
};

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /** Listado de insumos con stock (ítems de inventario). */
  findSupplyItems(filters: {
    warehouseId?: string;
    isActive?: boolean;
    supplyTypeId?: string;
    disponible?: boolean;
    faltante?: boolean;
  }) {
    const where: Prisma.SupplyWhereInput = {};
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.supplyTypeId) where.supplyTypeId = filters.supplyTypeId;
    if (filters.disponible) where.stockOnHand = { gt: 0 };
    if (filters.faltante) where.stockShortage = { gt: 0 };

    return this.prisma.supply.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        supplyType: { select: { id: true, code: true, name: true } },
        unitOfMeasure: { select: { id: true, code: true, name: true } },
        defaultSupplier: { select: { id: true, legalName: true, tradeName: true } },
        stockLots: filters.warehouseId
          ? { where: { warehouseId: filters.warehouseId } }
          : { take: 5, orderBy: { updatedAt: 'desc' } },
      },
    });
  }

  async findSupplyItem(supplyId: string) {
    const supply = await this.prisma.supply.findUnique({
      where: { id: supplyId },
      include: {
        supplyType: true,
        unitOfMeasure: true,
        defaultSupplier: true,
        stockLots: {
          include: { warehouse: { select: { id: true, name: true, code: true } } },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
    if (!supply) throw new NotFoundException('Insumo no encontrado');
    return supply;
  }

  findMovements(filters: {
    supplyId?: string;
    warehouseId?: string;
    movementType?: string;
    isActive?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: Prisma.InventoryMovementWhereInput = {};
    if (filters.supplyId) where.supplyId = filters.supplyId;
    if (filters.warehouseId) where.warehouseId = filters.warehouseId;
    if (filters.movementType) where.movementType = filters.movementType;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.dateFrom || filters.dateTo) {
      where.occurredAt = {};
      if (filters.dateFrom) where.occurredAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.occurredAt.lte = new Date(filters.dateTo);
    }

    return this.prisma.inventoryMovement.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      include: movementInclude,
    });
  }

  async findMovement(id: string) {
    const item = await this.prisma.inventoryMovement.findUnique({
      where: { id },
      include: movementInclude,
    });
    if (!item) throw new NotFoundException('Movimiento no encontrado');
    return item;
  }

  async createMovement(dto: CreateMovementDto, userId: string) {
    if (
      dto.movementType !== MovementType.ADJUSTMENT &&
      dto.quantity <= 0
    ) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }
    const delta = this.resolveSignedDelta(dto.movementType, dto.quantity);
    if (delta.isZero()) {
      throw new BadRequestException('La cantidad del movimiento no puede ser cero');
    }

    const supply = await this.prisma.supply.findUnique({ where: { id: dto.supplyId } });
    if (!supply) throw new NotFoundException('Insumo no encontrado');
    if (!supply.isActive) throw new BadRequestException('El insumo está inactivo');

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: {
          warehouseId: dto.warehouseId,
          supplyId: dto.supplyId,
          productId: dto.productId,
          lotCode: dto.lotCode,
          serialCode: dto.serialCode,
          movementType: dto.movementType,
          quantity: this.storedQuantity(dto.movementType, dto.quantity),
          unitOfMeasureId: dto.unitOfMeasureId,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          notes: dto.notes,
          isActive: true,
          occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
          createdByUserId: userId,
        },
        include: movementInclude,
      });

      await this.applyStockDelta(tx, {
        supplyId: dto.supplyId,
        warehouseId: dto.warehouseId,
        unitOfMeasureId: dto.unitOfMeasureId,
        lotCode: dto.lotCode ?? null,
        delta,
        userId,
      });

      return movement;
    });
  }

  async updateMovement(id: string, dto: UpdateMovementDto) {
    const existing = await this.findMovement(id);
    if (!existing.isActive) {
      throw new BadRequestException('No se puede editar un movimiento desactivado');
    }

    return this.prisma.$transaction(async (tx) => {
      const oldSigned = this.movementSignedQuantity(existing);
      await this.applyStockDelta(tx, {
        supplyId: existing.supplyId!,
        warehouseId: existing.warehouseId,
        unitOfMeasureId: existing.unitOfMeasureId,
        lotCode: existing.lotCode,
        delta: oldSigned.neg(),
        userId: existing.createdByUserId,
      });

      const warehouseId = dto.warehouseId ?? existing.warehouseId;
      const supplyId = dto.supplyId ?? existing.supplyId!;
      const unitOfMeasureId = dto.unitOfMeasureId ?? existing.unitOfMeasureId;
      const lotCode = dto.lotCode !== undefined ? dto.lotCode : existing.lotCode;

      const updated = await tx.inventoryMovement.update({
        where: { id },
        data: {
          warehouseId: dto.warehouseId,
          supplyId: dto.supplyId,
          productId: dto.productId,
          lotCode: dto.lotCode,
          serialCode: dto.serialCode,
          movementType: dto.movementType,
          quantity:
            dto.quantity !== undefined && dto.movementType
              ? this.storedQuantity(dto.movementType, dto.quantity)
              : dto.quantity !== undefined
                ? this.storedQuantity(existing.movementType as MovementType, dto.quantity)
                : undefined,
          unitOfMeasureId: dto.unitOfMeasureId,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          notes: dto.notes,
          occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
        },
        include: movementInclude,
      });

      const newSigned = this.movementSignedQuantity(updated);
      if (newSigned.isZero()) {
        throw new BadRequestException('La cantidad del movimiento no puede ser cero');
      }

      await this.applyStockDelta(tx, {
        supplyId,
        warehouseId,
        unitOfMeasureId,
        lotCode: lotCode ?? null,
        delta: newSigned,
        userId: existing.createdByUserId,
      });

      return updated;
    });
  }

  async deactivateMovement(id: string) {
    const existing = await this.findMovement(id);
    if (!existing.isActive) return existing;
    if (!existing.supplyId) {
      throw new BadRequestException('Movimiento sin insumo asociado');
    }

    return this.prisma.$transaction(async (tx) => {
      const signed = this.movementSignedQuantity(existing);
      await this.applyStockDelta(tx, {
        supplyId: existing.supplyId!,
        warehouseId: existing.warehouseId,
        unitOfMeasureId: existing.unitOfMeasureId,
        lotCode: existing.lotCode,
        delta: signed.neg(),
        userId: existing.createdByUserId,
      });

      return tx.inventoryMovement.update({
        where: { id },
        data: { isActive: false },
        include: movementInclude,
      });
    });
  }

  async removeMovement(id: string) {
    const existing = await this.findMovement(id);
    if (existing.isActive) {
      throw new BadRequestException('Desactive el movimiento antes de eliminarlo');
    }
    return this.prisma.inventoryMovement.delete({
      where: { id },
      include: movementInclude,
    });
  }

  async createSupplyWithInventory(dto: CreateSupplyWithInventoryDto, userId: string) {
    const supply = await this.prisma.supply.create({
      data: {
        name: dto.name,
        supplyTypeId: dto.supplyTypeId,
        unitOfMeasureId: dto.unitOfMeasureId,
        defaultSupplierId: dto.defaultSupplierId,
        sku: dto.sku,
        description: dto.description,
        purchaseUnitPrice:
          dto.purchaseUnitPrice !== undefined
            ? new Prisma.Decimal(dto.purchaseUnitPrice)
            : undefined,
        sellerUserId: userId,
        createdByUserId: userId,
        stockOnHand: new Prisma.Decimal(0),
        stockOnWay: new Prisma.Decimal(0),
      },
      include: {
        supplyType: true,
        unitOfMeasure: true,
      },
    });

    if (
      dto.warehouseId &&
      dto.initialQuantity !== undefined &&
      dto.initialQuantity !== 0
    ) {
      await this.createMovement(
        {
          warehouseId: dto.warehouseId,
          supplyId: supply.id,
          movementType: MovementType.ADJUSTMENT,
          quantity: dto.initialQuantity,
          unitOfMeasureId: dto.unitOfMeasureId,
          notes: dto.initialNotes ?? 'Stock inicial al registrar insumo',
        },
        userId,
      );
    }

    return this.findSupplyItem(supply.id);
  }

  private movementSignedQuantity(movement: {
    movementType: string;
    quantity: Prisma.Decimal;
  }): Prisma.Decimal {
    const qty = new Prisma.Decimal(movement.quantity);
    if (movement.movementType === MovementType.ADJUSTMENT) {
      return qty;
    }
    return this.resolveSignedDelta(movement.movementType as MovementType, Number(qty));
  }

  private storedQuantity(movementType: MovementType | string, quantity: number): Prisma.Decimal {
    if (movementType === MovementType.ADJUSTMENT) {
      return new Prisma.Decimal(quantity);
    }
    return new Prisma.Decimal(Math.abs(quantity));
  }

  private resolveSignedDelta(movementType: MovementType | string, quantity: number): Prisma.Decimal {
    const abs = new Prisma.Decimal(Math.abs(quantity));
    switch (movementType) {
      case MovementType.ADJUSTMENT:
        return new Prisma.Decimal(quantity);
      case MovementType.OUTBOUND:
        return abs.neg();
      case MovementType.INBOUND:
      case MovementType.RETURN:
        return abs;
      case MovementType.TRANSFER:
        return new Prisma.Decimal(quantity);
      default:
        return new Prisma.Decimal(quantity);
    }
  }

  private async applyStockDelta(
    tx: Prisma.TransactionClient,
    params: {
      supplyId: string;
      warehouseId: string;
      unitOfMeasureId: string;
      lotCode: string | null;
      delta: Prisma.Decimal;
      userId: string;
    },
  ) {
    const supply = await tx.supply.findUnique({ where: { id: params.supplyId } });
    if (!supply) throw new NotFoundException('Insumo no encontrado');

    const newGlobal = new Prisma.Decimal(supply.stockOnHand).add(params.delta);
    if (newGlobal.lessThan(0)) {
      throw new BadRequestException('Stock insuficiente para este movimiento');
    }

    await tx.supply.update({
      where: { id: params.supplyId },
      data: { stockOnHand: newGlobal },
    });

    const lotWhere: Prisma.InventoryStockLotWhereInput = {
      warehouseId: params.warehouseId,
      supplyId: params.supplyId,
      lotCode: params.lotCode,
    };

    const existingLot = await tx.inventoryStockLot.findFirst({ where: lotWhere });

    if (existingLot) {
      const newLotQty = new Prisma.Decimal(existingLot.quantityOnHand).add(params.delta);
      if (newLotQty.lessThan(0)) {
        throw new BadRequestException('Stock insuficiente en el almacén seleccionado');
      }
      await tx.inventoryStockLot.update({
        where: { id: existingLot.id },
        data: { quantityOnHand: newLotQty },
      });
    } else if (params.delta.greaterThan(0)) {
      await tx.inventoryStockLot.create({
        data: {
          warehouseId: params.warehouseId,
          supplyId: params.supplyId,
          lotCode: params.lotCode,
          quantityOnHand: params.delta,
          unitOfMeasureId: params.unitOfMeasureId,
          createdByUserId: params.userId,
        },
      });
    } else {
      throw new BadRequestException('No hay stock en ese almacén para esta salida');
    }
  }

  /**
   * Recalculate stock_requested and stock_shortage for one or all supplies.
   * Formula:
   *   demanda = SUM(required_qty - executed_qty) for open WOs
   *   stock_requested = MAX(0, demanda - stock_on_hand - stock_on_way)
   *   stock_shortage = stock_requested
   */
  async recalculateSupplyStockDemand(supplyId?: string) {
    const whereSupply = supplyId ? { id: supplyId } : {};
    const supplies = await this.prisma.supply.findMany({
      where: { ...whereSupply, isActive: true },
      select: { id: true, stockOnHand: true, stockOnWay: true },
    });

    for (const supply of supplies) {
      const aggregate = await this.prisma.workOrderSupplyItem.aggregate({
        where: {
          supplyId: supply.id,
          workOrder: { status: { in: ['pending', 'in_progress'] } },
        },
        _sum: { requiredQty: true, executedQty: true },
      });

      const totalRequired = Number(aggregate._sum.requiredQty ?? 0);
      const totalExecuted = Number(aggregate._sum.executedQty ?? 0);
      const demanda = totalRequired - totalExecuted;
      const onHand = Number(supply.stockOnHand);
      const onWay = Number(supply.stockOnWay);
      const stockRequested = Math.max(0, demanda - onHand - onWay);

      await this.prisma.supply.update({
        where: { id: supply.id },
        data: { stockRequested, stockShortage: stockRequested },
      });
    }
  }
}
