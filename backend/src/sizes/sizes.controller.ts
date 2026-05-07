import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SizesService } from './sizes.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@ApiTags('Sizes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sizes')
export class SizesController {
  constructor(private readonly service: SizesService) {}

  @Get()
  @ApiOperation({ summary: 'List all sizes' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get size by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create size' })
  create(@Body() dto: CreateSizeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update size' })
  update(@Param('id') id: string, @Body() dto: UpdateSizeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate size' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
