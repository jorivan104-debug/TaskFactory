// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncRequestDto } from './dto/create-sync-request.dto';

@Injectable()
export class AccountingSyncService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { status?: string; dateFrom?: string; dateTo?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    return this.prisma.accountingSyncRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.accountingSyncRequest.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Sync request not found');
    return item;
  }

  create(dto: CreateSyncRequestDto, userId: string) {
    return this.prisma.accountingSyncRequest.create({
      data: {
        payloadJson: dto.payloadJson,
        status: 'pending',
        createdByUserId: userId,
      },
    });
  }

  async retry(id: string) {
    await this.findOne(id);
    return this.prisma.accountingSyncRequest.update({
      where: { id },
      data: {
        status: 'retry_pending',
        retryCount: { increment: 1 },
        lastRetriedAt: new Date(),
      },
    });
  }
}
