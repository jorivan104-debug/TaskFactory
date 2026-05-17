import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { GarmentReferencesService } from './garment-references.service';
import { CreateGarmentReferenceDto } from './dto/create-garment-reference.dto';
import { UpdateGarmentReferenceDto } from './dto/update-garment-reference.dto';

@ApiTags('Garment References')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('garment-references')
export class GarmentReferencesController {
  constructor(private readonly service: GarmentReferencesService) {}

  @Get()
  @ApiOperation({ summary: 'List catalog garment references' })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'referenceType', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  findAll(
    @Query('isActive') isActive?: string,
    @Query('referenceType') referenceType?: string,
    @Query('brandId') brandId?: string,
  ) {
    return this.service.findAll({
      isActive: isActive === undefined ? undefined : isActive === 'true',
      referenceType,
      brandId,
    });
  }

  @Get('preview')
  @ApiOperation({ summary: 'Preview next ID (code), serie and sequence' })
  @ApiQuery({ name: 'brandId', required: true })
  @ApiQuery({ name: 'referenceType', required: true })
  preview(
    @Query('brandId') brandId: string,
    @Query('referenceType') referenceType: string,
  ) {
    return this.service.previewNext(brandId, referenceType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get garment reference by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create garment reference' })
  create(@Body() dto: CreateGarmentReferenceDto, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update garment reference' })
  update(@Param('id') id: string, @Body() dto: UpdateGarmentReferenceDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate garment reference' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
