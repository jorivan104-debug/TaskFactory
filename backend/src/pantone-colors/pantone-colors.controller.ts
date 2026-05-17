import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PantoneColorsService } from './pantone-colors.service';
import { CreatePantoneColorDto } from './dto/create-pantone-color.dto';
import { UpdatePantoneColorDto } from './dto/update-pantone-color.dto';

@ApiTags('Pantone Colors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pantone-colors')
export class PantoneColorsController {
  constructor(private readonly service: PantoneColorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all pantone colors' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pantone color by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create pantone color' })
  create(@Body() dto: CreatePantoneColorDto, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pantone color' })
  update(@Param('id') id: string, @Body() dto: UpdatePantoneColorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate pantone color' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
