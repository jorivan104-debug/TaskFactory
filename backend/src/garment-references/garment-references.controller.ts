import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GarmentReferencesService } from './garment-references.service';
import { UpdateGarmentReferenceCatalogDto } from './dto/update-garment-reference-catalog.dto';

@ApiTags('Garment References')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('garment-references')
export class GarmentReferencesController {
  constructor(private readonly service: GarmentReferencesService) {}

  @Get()
  @ApiOperation({ summary: 'List Lexi catalog references' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.service.findAllCatalog({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get garment reference by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update catalog reference status/notes' })
  update(@Param('id') id: string, @Body() dto: UpdateGarmentReferenceCatalogDto) {
    return this.service.updateCatalog(id, dto);
  }
}
