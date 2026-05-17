import { Controller, Get, Post, Patch, Delete, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WorkOrderTypesService } from './work-order-types.service';
import { CreateWorkOrderTypeDto } from './dto/create-work-order-type.dto';
import { UpdateWorkOrderTypeDto } from './dto/update-work-order-type.dto';
import { SaveBlueprintDto } from './dto/save-blueprint.dto';

@ApiTags('Work Order Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-order-types')
export class WorkOrderTypesController {
  constructor(private readonly service: WorkOrderTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all work order types' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work order type by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create work order type' })
  create(@Body() dto: CreateWorkOrderTypeDto, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update work order type' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete work order type' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ─── Blueprint ───

  @Get(':id/blueprint')
  @ApiOperation({ summary: 'Get blueprint for a type' })
  @ApiQuery({ name: 'draft', required: false, type: Boolean })
  getBlueprint(@Param('id') id: string, @Query('draft') draft?: string) {
    return this.service.getBlueprint(id, draft === 'true');
  }

  @Put(':id/blueprint')
  @ApiOperation({ summary: 'Save blueprint draft' })
  saveBlueprint(
    @Param('id') id: string,
    @Body() dto: SaveBlueprintDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.saveBlueprint(id, dto, user.id);
  }

  @Post(':id/blueprint/publish')
  @ApiOperation({ summary: 'Validate and publish blueprint' })
  publishBlueprint(@Param('id') id: string) {
    return this.service.publishBlueprint(id);
  }
}
