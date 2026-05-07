import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupplyTypesService } from './supply-types.service';
import { CreateSupplyTypeDto } from './dto/create-supply-type.dto';
import { UpdateSupplyTypeDto } from './dto/update-supply-type.dto';

@ApiTags('Supply Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supply-types')
export class SupplyTypesController {
  constructor(private readonly service: SupplyTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all supply types' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supply type by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create supply type' })
  create(@Body() dto: CreateSupplyTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supply type' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplyTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate supply type' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
