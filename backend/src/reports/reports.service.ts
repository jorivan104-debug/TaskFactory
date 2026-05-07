import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProductionSummary(dateFrom?: string, dateTo?: string) {
    return {
      period: { from: dateFrom ?? null, to: dateTo ?? null },
      totalOrders: 0,
      totalUnitsProduced: 0,
      avgTimePerProcessHours: 0,
      byStatus: {
        draft: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      },
      byProductionType: {
        internal: 0,
        external: 0,
        mixed: 0,
      },
    };
  }

  async getCostPerReference() {
    return {
      references: [
        {
          referenceId: 'placeholder',
          referenceName: 'Sample Reference',
          totalCost: 0,
          materialCost: 0,
          laborCost: 0,
          overheadCost: 0,
          unitCost: 0,
          unitsProduced: 0,
        },
      ],
    };
  }

  async getInventorySummary() {
    return {
      totalProducts: 0,
      totalStockValue: 0,
      byWarehouse: [
        {
          warehouseId: 'placeholder',
          warehouseName: 'Sample Warehouse',
          totalItems: 0,
          totalValue: 0,
        },
      ],
      lowStockAlerts: [],
    };
  }

  async getEmployeePerformance(dateFrom?: string, dateTo?: string) {
    return {
      period: { from: dateFrom ?? null, to: dateTo ?? null },
      employees: [
        {
          employeeId: 'placeholder',
          employeeName: 'Sample Employee',
          tasksAssigned: 0,
          tasksCompleted: 0,
          completionRate: 0,
          avgCompletionTimeHours: 0,
          totalHoursWorked: 0,
        },
      ],
    };
  }

  async getKpis() {
    return {
      generatedAt: new Date().toISOString(),
      kpis: {
        productionEfficiency: {
          value: 0,
          unit: 'percent',
          description: 'Percentage of orders completed on time',
        },
        averageLeadTimeDays: {
          value: 0,
          unit: 'days',
          description: 'Average days from order creation to completion',
        },
        inventoryTurnover: {
          value: 0,
          unit: 'ratio',
          description: 'How many times inventory is sold and replaced per period',
        },
        defectRate: {
          value: 0,
          unit: 'percent',
          description: 'Percentage of units with quality issues',
        },
        employeeUtilization: {
          value: 0,
          unit: 'percent',
          description: 'Percentage of available hours spent on productive tasks',
        },
        onTimeDeliveryRate: {
          value: 0,
          unit: 'percent',
          description: 'Percentage of shipments delivered on or before estimated date',
        },
      },
    };
  }
}
