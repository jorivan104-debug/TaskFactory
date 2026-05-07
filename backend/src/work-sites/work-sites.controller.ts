import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WorkSitesService } from './work-sites.service';
import { CreateWorkSiteDto } from './dto/create-work-site.dto';
import { UpdateWorkSiteDto } from './dto/update-work-site.dto';

@ApiTags('Work Sites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-sites')
export class WorkSitesController {
  constructor(private readonly service: WorkSitesService) {}

  @Get()
  @ApiOperation({ summary: 'List all work sites' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work site by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create work site' })
  create(@Body() dto: CreateWorkSiteDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update work site' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkSiteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate work site' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
