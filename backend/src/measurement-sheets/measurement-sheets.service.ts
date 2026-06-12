import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeasurementSheetDto } from './dto/create-measurement-sheet.dto';
import {
  UpdateMeasurementSheetDto,
  UpsertMeasurementCellsDto,
} from './dto/upsert-cell.dto';

@Injectable()
export class MeasurementSheetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(workOrderId: string) {
    await this.assertWorkOrder(workOrderId);
    const sheet = await this.prisma.workOrderMeasurementSheet.findUnique({
      where: { workOrderId },
      include: {
        columns: {
          orderBy: { sortOrder: 'asc' },
          include: { size: { select: { id: true, name: true, sortOrder: true } } },
        },
        cells: true,
      },
    });
    return sheet;
  }

  async create(workOrderId: string, dto: CreateMeasurementSheetDto, userId: string) {
    await this.assertWorkOrder(workOrderId);

    const existing = await this.prisma.workOrderMeasurementSheet.findUnique({
      where: { workOrderId },
    });
    if (existing) {
      throw new ConflictException('Esta orden de trabajo ya tiene una tabla de medidas');
    }

    const sizeIds = await this.resolveSizeIds(workOrderId, dto.sizeIds);
    if (sizeIds.length === 0) {
      throw new BadRequestException(
        'Define al menos una talla en la curva de la orden o envía sizeIds para crear la tabla de medidas',
      );
    }

    const points = await this.prisma.garmentMeasurementPoint.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true },
    });

    return this.prisma.$transaction(async (tx) => {
      const sheet = await tx.workOrderMeasurementSheet.create({
        data: { workOrderId, createdByUserId: userId },
      });

      if (sizeIds.length > 0) {
        await tx.workOrderMeasurementSheetColumn.createMany({
          data: sizeIds.map((sizeId, idx) => ({
            sheetId: sheet.id,
            sizeId,
            sortOrder: idx,
            updatedAt: new Date(),
          })),
        });
      }

      if (points.length > 0 && sizeIds.length > 0) {
        const cellsData: {
          sheetId: string;
          garmentMeasurementPointId: string;
          sizeId: string;
          updatedAt: Date;
        }[] = [];
        for (const p of points) {
          for (const sizeId of sizeIds) {
            cellsData.push({
              sheetId: sheet.id,
              garmentMeasurementPointId: p.id,
              sizeId,
              updatedAt: new Date(),
            });
          }
        }
        await tx.workOrderMeasurementSheetCell.createMany({ data: cellsData });
      }

      return tx.workOrderMeasurementSheet.findUnique({
        where: { id: sheet.id },
        include: {
          columns: {
            orderBy: { sortOrder: 'asc' },
            include: { size: { select: { id: true, name: true, sortOrder: true } } },
          },
          cells: true,
        },
      });
    });
  }

  async update(workOrderId: string, dto: UpdateMeasurementSheetDto) {
    const sheet = await this.assertSheet(workOrderId);
    return this.prisma.workOrderMeasurementSheet.update({
      where: { id: sheet.id },
      data: dto,
    });
  }

  async upsertCells(workOrderId: string, dto: UpsertMeasurementCellsDto) {
    const sheet = await this.assertSheet(workOrderId);

    return this.prisma.$transaction(async (tx) => {
      for (const cell of dto.cells) {
        await tx.workOrderMeasurementSheetCell.upsert({
          where: {
            sheetId_garmentMeasurementPointId_sizeId: {
              sheetId: sheet.id,
              garmentMeasurementPointId: cell.garmentMeasurementPointId,
              sizeId: cell.sizeId,
            },
          },
          create: {
            sheetId: sheet.id,
            garmentMeasurementPointId: cell.garmentMeasurementPointId,
            sizeId: cell.sizeId,
            valueCm: cell.valueCm ?? null,
          },
          update: { valueCm: cell.valueCm ?? null },
        });
      }
      return tx.workOrderMeasurementSheetCell.findMany({ where: { sheetId: sheet.id } });
    });
  }

  async remove(workOrderId: string) {
    const sheet = await this.assertSheet(workOrderId);
    await this.prisma.workOrderMeasurementSheet.delete({ where: { id: sheet.id } });
  }

  async listPoints() {
    return this.prisma.garmentMeasurementPoint.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ── Helpers ──

  private async assertWorkOrder(id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!wo) throw new NotFoundException('Orden de trabajo no encontrada');
  }

  private async assertSheet(workOrderId: string) {
    await this.assertWorkOrder(workOrderId);
    const sheet = await this.prisma.workOrderMeasurementSheet.findUnique({
      where: { workOrderId },
      select: { id: true },
    });
    if (!sheet) throw new NotFoundException('La OT aún no tiene tabla de medidas');
    return sheet;
  }

  private async resolveSizeIds(workOrderId: string, override?: string[]) {
    if (override && override.length > 0) return override;
    const curve = await this.prisma.workOrderSizeCurveItem.findMany({
      where: { workOrderId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { sizeId: true },
    });
    return curve.map((c) => c.sizeId);
  }
}
