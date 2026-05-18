import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FabricPieceSheetsService } from './fabric-piece-sheets.service';
import { CreateFabricPieceSheetDto } from './dto/create-fabric-piece-sheet.dto';
import { UpdateFabricPieceSheetDto } from './dto/update-fabric-piece-sheet.dto';
import { UpsertPieceDto } from './dto/upsert-piece.dto';
import { ReplaceRollsDto } from './dto/replace-rolls.dto';
import { SetFabricUsageDto } from './dto/set-fabric-usage.dto';
import { UploadPieceImageDto } from './dto/upload-piece-image.dto';

@ApiTags('Fabric Piece Sheets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-orders/:workOrderId/fabric-piece-sheets')
export class FabricPieceSheetsController {
  constructor(private readonly service: FabricPieceSheetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar fichas de piezas por tela en la OT' })
  findAll(@Param('workOrderId') workOrderId: string) {
    return this.service.findAll(workOrderId);
  }

  @Get(':sheetId')
  @ApiOperation({ summary: 'Detalle de ficha (piezas + rollos)' })
  findOne(@Param('workOrderId') workOrderId: string, @Param('sheetId') sheetId: string) {
    return this.service.findOne(workOrderId, sheetId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear ficha manualmente para un insumo de tela de la OT' })
  create(
    @Param('workOrderId') workOrderId: string,
    @Body() dto: CreateFabricPieceSheetDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.create(workOrderId, dto.workOrderSupplyItemId, user.id);
  }

  @Patch(':sheetId')
  @ApiOperation({ summary: 'Actualizar cabecera de la ficha' })
  update(
    @Param('workOrderId') workOrderId: string,
    @Param('sheetId') sheetId: string,
    @Body() dto: UpdateFabricPieceSheetDto,
  ) {
    return this.service.update(workOrderId, sheetId, dto);
  }

  // ── Piezas ──

  @Post(':sheetId/pieces')
  @ApiOperation({ summary: 'Agregar pieza a la ficha' })
  addPiece(
    @Param('workOrderId') workOrderId: string,
    @Param('sheetId') sheetId: string,
    @Body() dto: UpsertPieceDto,
  ) {
    return this.service.addPiece(workOrderId, sheetId, dto);
  }

  @Patch(':sheetId/pieces/:pieceId')
  @ApiOperation({ summary: 'Editar pieza (incluida imagen)' })
  updatePiece(
    @Param('workOrderId') workOrderId: string,
    @Param('sheetId') sheetId: string,
    @Param('pieceId') pieceId: string,
    @Body() dto: UpsertPieceDto,
  ) {
    return this.service.updatePiece(workOrderId, sheetId, pieceId, dto);
  }

  @Delete(':sheetId/pieces/:pieceId')
  @ApiOperation({ summary: 'Eliminar pieza' })
  removePiece(
    @Param('workOrderId') workOrderId: string,
    @Param('sheetId') sheetId: string,
    @Param('pieceId') pieceId: string,
  ) {
    return this.service.removePiece(workOrderId, sheetId, pieceId);
  }

  @Put(':sheetId/pieces/:pieceId/image')
  @ApiOperation({ summary: 'Establecer o quitar la imagen de una pieza (data URL)' })
  setPieceImage(
    @Param('workOrderId') workOrderId: string,
    @Param('sheetId') sheetId: string,
    @Param('pieceId') pieceId: string,
    @Body() dto: UploadPieceImageDto,
  ) {
    return this.service.setPieceImage(workOrderId, sheetId, pieceId, dto.imageUrl ?? null);
  }

  // ── Rollos ──

  @Put(':sheetId/rolls')
  @ApiOperation({ summary: 'Reemplazar tabla de rollos (recalcula total de metros)' })
  replaceRolls(
    @Param('workOrderId') workOrderId: string,
    @Param('sheetId') sheetId: string,
    @Body() dto: ReplaceRollsDto,
  ) {
    return this.service.replaceRolls(workOrderId, sheetId, dto);
  }

  // ── Marcar tela como principal o tela bolsillo (sin ficha propia) ──

  @Patch('supply-items/:supplyItemId/fabric-usage')
  @ApiOperation({ summary: 'Marcar insumo de tela como principal o tela bolsillo' })
  setFabricUsage(
    @Param('workOrderId') workOrderId: string,
    @Param('supplyItemId') supplyItemId: string,
    @Body() dto: SetFabricUsageDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.setFabricUsage(workOrderId, supplyItemId, dto.fabricUsage, user.id);
  }
}
