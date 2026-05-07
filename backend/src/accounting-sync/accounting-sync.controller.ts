import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AccountingSyncService } from './accounting-sync.service';
import { CreateSyncRequestDto } from './dto/create-sync-request.dto';

@ApiTags('Accounting Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting-sync')
export class AccountingSyncController {
  constructor(private readonly service: AccountingSyncService) {}

  @Get()
  @ApiOperation({ summary: 'List accounting sync requests' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.findAll({ status, dateFrom, dateTo });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sync request with full payload' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create accounting sync request' })
  create(@Body() dto: CreateSyncRequestDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed sync request' })
  retry(@Param('id') id: string) {
    return this.service.retry(id);
  }
}
