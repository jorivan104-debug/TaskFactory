import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('production-summary')
  @ApiOperation({ summary: 'Production summary report' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getProductionSummary(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.getProductionSummary(dateFrom, dateTo);
  }

  @Get('cost-per-reference')
  @ApiOperation({ summary: 'Cost analysis per garment reference' })
  getCostPerReference() {
    return this.service.getCostPerReference();
  }

  @Get('inventory-summary')
  @ApiOperation({ summary: 'Inventory stock levels summary' })
  getInventorySummary() {
    return this.service.getInventorySummary();
  }

  @Get('employee-performance')
  @ApiOperation({ summary: 'Employee task completion rates' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getEmployeePerformance(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.getEmployeePerformance(dateFrom, dateTo);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'All KPIs in one response' })
  getKpis() {
    return this.service.getKpis();
  }
}
