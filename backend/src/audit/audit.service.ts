// @ts-nocheck

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogAuditParams {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  changesJson?: any;
  ipAddress?: string;
}

export interface AuditFilters {
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(params: LogAuditParams) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changesJson: params.changesJson ?? undefined,
        ipAddress: params.ipAddress,
      },
    });
  }

  findAll(filters: AuditFilters) {
    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.userId) where.userId = filters.userId;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, fullName: true } } },
      take: 500,
    });
  }
}
