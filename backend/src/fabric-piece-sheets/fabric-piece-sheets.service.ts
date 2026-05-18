import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFabricPieceSheetDto } from './dto/update-fabric-piece-sheet.dto';
import { UpsertPieceDto } from './dto/upsert-piece.dto';
import { ReplaceRollsDto } from './dto/replace-rolls.dto';

const FABRIC_SUPPLY_TYPE_CODE = 'fabric';

@Injectable()
export class FabricPieceSheetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workOrderId: string) {
    await this.assertWorkOrder(workOrderId);
    return this.prisma.workOrderFabricPieceSheet.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'asc' },
      include: {
        workOrderSupplyItem: {
          include: {
            supply: {
              select: {
                id: true,
                name: true,
                sku: true,
                unitOfMeasure: { select: { code: true, name: true } },
                supplyType: { select: { code: true, name: true } },
              },
            },
          },
        },
        _count: { select: { pieces: true, rolls: true } },
      },
    });
  }

  async findOne(workOrderId: string, sheetId: string) {
    await this.assertWorkOrder(workOrderId);
    const sheet = await this.prisma.workOrderFabricPieceSheet.findFirst({
      where: { id: sheetId, workOrderId },
      include: {
        workOrderSupplyItem: {
          include: {
            supply: {
              select: {
                id: true,
                name: true,
                sku: true,
                unitOfMeasure: { select: { code: true, name: true } },
                supplyType: { select: { code: true, name: true } },
              },
            },
          },
        },
        pieces: { orderBy: { sortOrder: 'asc' } },
        rolls: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!sheet) throw new NotFoundException('Ficha de piezas no encontrada');
    return sheet;
  }

  async create(workOrderId: string, supplyItemId: string, userId: string) {
    await this.assertWorkOrder(workOrderId);
    const supplyItem = await this.prisma.workOrderSupplyItem.findFirst({
      where: { id: supplyItemId, workOrderId },
      include: { supply: { include: { supplyType: true } } },
    });
    if (!supplyItem) {
      throw new NotFoundException('Insumo de la OT no encontrado');
    }
    if (supplyItem.supply.supplyType.code !== FABRIC_SUPPLY_TYPE_CODE) {
      throw new BadRequestException('Solo se pueden crear fichas para insumos de tipo Tela');
    }
    if (supplyItem.fabricUsage !== 'main') {
      throw new BadRequestException(
        'La tela está marcada como auxiliar (p. ej. tela bolsillo) y no genera ficha propia',
      );
    }

    const existing = await this.prisma.workOrderFabricPieceSheet.findUnique({
      where: { workOrderSupplyItemId: supplyItemId },
    });
    if (existing) {
      throw new ConflictException('Ya existe una ficha de piezas para esta tela');
    }

    return this.prisma.workOrderFabricPieceSheet.create({
      data: {
        workOrderId,
        workOrderSupplyItemId: supplyItemId,
        createdByUserId: userId,
      },
      include: {
        workOrderSupplyItem: { include: { supply: true } },
        pieces: true,
        rolls: true,
      },
    });
  }

  async update(workOrderId: string, sheetId: string, dto: UpdateFabricPieceSheetDto) {
    await this.findOne(workOrderId, sheetId);
    const data: Record<string, unknown> = { ...dto };
    if (dto.sheetDate !== undefined) {
      data.sheetDate = dto.sheetDate ? new Date(dto.sheetDate) : null;
    }
    return this.prisma.workOrderFabricPieceSheet.update({
      where: { id: sheetId },
      data,
      include: {
        workOrderSupplyItem: { include: { supply: true } },
        pieces: { orderBy: { sortOrder: 'asc' } },
        rolls: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  // ── Piezas ──

  async addPiece(workOrderId: string, sheetId: string, dto: UpsertPieceDto) {
    await this.findOne(workOrderId, sheetId);
    const count = await this.prisma.workOrderFabricPieceSheetPiece.count({
      where: { pieceSheetId: sheetId },
    });
    return this.prisma.workOrderFabricPieceSheetPiece.create({
      data: {
        pieceSheetId: sheetId,
        name: dto.name,
        materialSlot: dto.materialSlot ?? 1,
        quantity: dto.quantity ?? 1,
        isPair: dto.isPair ?? false,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? count,
      },
    });
  }

  async updatePiece(
    workOrderId: string,
    sheetId: string,
    pieceId: string,
    dto: UpsertPieceDto,
  ) {
    await this.findOne(workOrderId, sheetId);
    const piece = await this.prisma.workOrderFabricPieceSheetPiece.findFirst({
      where: { id: pieceId, pieceSheetId: sheetId },
    });
    if (!piece) throw new NotFoundException('Pieza no encontrada');
    return this.prisma.workOrderFabricPieceSheetPiece.update({
      where: { id: pieceId },
      data: {
        name: dto.name,
        materialSlot: dto.materialSlot ?? piece.materialSlot,
        quantity: dto.quantity ?? piece.quantity,
        isPair: dto.isPair ?? piece.isPair,
        imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : piece.imageUrl,
        sortOrder: dto.sortOrder ?? piece.sortOrder,
      },
    });
  }

  async removePiece(workOrderId: string, sheetId: string, pieceId: string) {
    await this.findOne(workOrderId, sheetId);
    const piece = await this.prisma.workOrderFabricPieceSheetPiece.findFirst({
      where: { id: pieceId, pieceSheetId: sheetId },
    });
    if (!piece) throw new NotFoundException('Pieza no encontrada');
    return this.prisma.workOrderFabricPieceSheetPiece.delete({ where: { id: pieceId } });
  }

  async setPieceImage(
    workOrderId: string,
    sheetId: string,
    pieceId: string,
    imageUrl: string | null | undefined,
  ) {
    await this.findOne(workOrderId, sheetId);
    const piece = await this.prisma.workOrderFabricPieceSheetPiece.findFirst({
      where: { id: pieceId, pieceSheetId: sheetId },
    });
    if (!piece) throw new NotFoundException('Pieza no encontrada');
    return this.prisma.workOrderFabricPieceSheetPiece.update({
      where: { id: pieceId },
      data: { imageUrl: imageUrl || null },
    });
  }

  // ── Rollos ──

  async replaceRolls(workOrderId: string, sheetId: string, dto: ReplaceRollsDto) {
    await this.findOne(workOrderId, sheetId);

    return this.prisma.$transaction(async (tx) => {
      await tx.workOrderFabricPieceSheetRoll.deleteMany({ where: { pieceSheetId: sheetId } });
      if (dto.items.length > 0) {
        await tx.workOrderFabricPieceSheetRoll.createMany({
          data: dto.items.map((r, idx) => ({
            pieceSheetId: sheetId,
            rollNumber: r.rollNumber,
            meters: r.meters,
            sortOrder: r.sortOrder ?? idx,
            updatedAt: new Date(),
          })),
        });
      }
      const totalMeters = dto.items.reduce((sum, r) => sum + Number(r.meters), 0);
      await tx.workOrderFabricPieceSheet.update({
        where: { id: sheetId },
        data: { totalMeters },
      });
      return tx.workOrderFabricPieceSheetRoll.findMany({
        where: { pieceSheetId: sheetId },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  // ── Auto-creación al copiar BOM o agregar tela manualmente ──

  /**
   * Crea fichas vacías para cada `WorkOrderSupplyItem` de tela `main` que aún no tenga ficha.
   * Idempotente: si ya existen, no hace nada.
   */
  async ensureSheetsForWorkOrder(workOrderId: string, userId: string, tx?: any) {
    const db = tx ?? this.prisma;
    const fabricItems = await db.workOrderSupplyItem.findMany({
      where: {
        workOrderId,
        fabricUsage: 'main',
        supply: { supplyType: { code: FABRIC_SUPPLY_TYPE_CODE } },
      },
      select: { id: true },
    });
    if (fabricItems.length === 0) return;

    const existing = await db.workOrderFabricPieceSheet.findMany({
      where: { workOrderId },
      select: { workOrderSupplyItemId: true },
    });
    const existingIds = new Set(existing.map((s: { workOrderSupplyItemId: string }) => s.workOrderSupplyItemId));

    const toCreate = fabricItems.filter((i: { id: string }) => !existingIds.has(i.id));
    if (toCreate.length === 0) return;

    await db.workOrderFabricPieceSheet.createMany({
      data: toCreate.map((i: { id: string }) => ({
        workOrderId,
        workOrderSupplyItemId: i.id,
        createdByUserId: userId,
        updatedAt: new Date(),
      })),
    });
  }

  /** Marca un insumo de la OT como tela principal o auxiliar (excluida de fichas). */
  async setFabricUsage(workOrderId: string, supplyItemId: string, fabricUsage: string, userId: string) {
    await this.assertWorkOrder(workOrderId);
    const item = await this.prisma.workOrderSupplyItem.findFirst({
      where: { id: supplyItemId, workOrderId },
      include: { supply: { include: { supplyType: true } } },
    });
    if (!item) throw new NotFoundException('Insumo de la OT no encontrado');
    if (item.supply.supplyType.code !== FABRIC_SUPPLY_TYPE_CODE) {
      throw new BadRequestException('fabricUsage solo aplica a insumos de tipo Tela');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workOrderSupplyItem.update({
        where: { id: supplyItemId },
        data: { fabricUsage },
      });
      if (fabricUsage === 'pocket') {
        await tx.workOrderFabricPieceSheet.deleteMany({
          where: { workOrderSupplyItemId: supplyItemId },
        });
      } else {
        await this.ensureSheetsForWorkOrder(workOrderId, userId, tx);
      }
      return tx.workOrderSupplyItem.findUnique({
        where: { id: supplyItemId },
        include: {
          supply: {
            include: { supplyType: true, unitOfMeasure: true },
          },
        },
      });
    });
  }

  private async assertWorkOrder(id: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id }, select: { id: true } });
    if (!wo) throw new NotFoundException('Orden de trabajo no encontrada');
  }
}
