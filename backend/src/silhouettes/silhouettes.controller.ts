import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SilhouettesService } from './silhouettes.service';
import { CreateSilhouetteCategoryDto } from './dto/create-silhouette-category.dto';
import { UpdateSilhouetteCategoryDto } from './dto/update-silhouette-category.dto';
import { CreateSilhouetteDto } from './dto/create-silhouette.dto';
import { UpdateSilhouetteDto } from './dto/update-silhouette.dto';

@ApiTags('Silhouettes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('silhouettes')
export class SilhouettesController {
  constructor(private readonly service: SilhouettesService) {}

  /* ─── Categories ─── */

  @Get('categories')
  @ApiOperation({ summary: 'List all silhouette categories' })
  findAllCategories() {
    return this.service.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get silhouette category by id' })
  findOneCategory(@Param('id') id: string) {
    return this.service.findOneCategory(id);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create silhouette category' })
  createCategory(@Body() dto: CreateSilhouetteCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update silhouette category' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateSilhouetteCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Deactivate silhouette category' })
  removeCategory(@Param('id') id: string) {
    return this.service.removeCategory(id);
  }

  /* ─── Silhouettes ─── */

  @Get()
  @ApiOperation({ summary: 'List all silhouettes' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get silhouette by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create silhouette' })
  create(@Body() dto: CreateSilhouetteDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update silhouette' })
  update(@Param('id') id: string, @Body() dto: UpdateSilhouetteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate silhouette' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
