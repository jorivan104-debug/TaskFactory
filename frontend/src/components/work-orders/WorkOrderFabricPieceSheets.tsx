import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClickableImage } from '../ui/ClickableImage';
import { fileToThumbnailDataUrl } from '../../lib/image';
import api from '../../lib/api';

interface SupplyRef {
  id: string;
  name: string;
  unitOfMeasure?: { code?: string; name?: string };
  supplyType?: { code?: string; name?: string };
}

interface SupplyItem {
  id: string;
  fabricUsage: string;
  supply: SupplyRef;
}

export interface FabricPieceSheetPiece {
  id: string;
  sortOrder: number;
  name: string;
  materialSlot: number;
  quantity: number;
  isPair: boolean;
  imageUrl?: string | null;
}

export interface FabricPieceSheetRoll {
  id: string;
  rollNumber: string;
  meters: string | number;
  sortOrder: number;
}

export interface FabricPieceSheet {
  id: string;
  status: string;
  sheetDate?: string | null;
  sizesPlaced?: number | null;
  realAverage?: string | number | null;
  markerLength?: string | number | null;
  labeledPiecesNotes?: string | null;
  pocketFabricNotes?: string | null;
  hasBias: boolean;
  biasWeight?: string | number | null;
  hasElastic: boolean;
  hasZipper: boolean;
  zipperWeight?: string | number | null;
  hasLuxuryZipper: boolean;
  programmedQty?: number | null;
  metersToUse?: string | number | null;
  leftoverMeters?: string | number | null;
  totalMeters?: string | number | null;
  notes?: string | null;
  workOrderSupplyItem: SupplyItem;
  pieces: FabricPieceSheetPiece[];
  rolls: FabricPieceSheetRoll[];
}

interface Props {
  workOrderId: string;
  sheets: FabricPieceSheet[];
  fabricSupplyItems: SupplyItem[];
}

const numStr = (v: string | number | null | undefined): string =>
  v === null || v === undefined || v === '' ? '' : String(v);

export function WorkOrderFabricPieceSheets({ workOrderId, sheets, fabricSupplyItems }: Props) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(sheets[0]?.id ?? null);

  useEffect(() => {
    if (!sheets.find((s) => s.id === activeId)) {
      setActiveId(sheets[0]?.id ?? null);
    }
  }, [sheets, activeId]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });

  // ── Marcar tela como bolsillo (oculta su ficha) ──
  const setUsageMutation = useMutation({
    mutationFn: async (vars: { supplyItemId: string; fabricUsage: string }) => {
      await api.patch(
        `/work-orders/${workOrderId}/fabric-piece-sheets/supply-items/${vars.supplyItemId}/fabric-usage`,
        { fabricUsage: vars.fabricUsage },
      );
    },
    onSuccess: invalidate,
  });

  const pocketFabrics = fabricSupplyItems.filter((i) => i.fabricUsage === 'pocket');

  if (sheets.length === 0 && fabricSupplyItems.length === 0) {
    return (
      <Card>
        <h2 className="font-semibold text-sm mb-2">Fichas de piezas por tela</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Esta OT aún no tiene insumos de tipo Tela.
        </p>
      </Card>
    );
  }

  if (sheets.length === 0) {
    return (
      <Card>
        <h2 className="font-semibold text-sm mb-2">Fichas de piezas por tela</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Todas las telas de esta OT están marcadas como tela bolsillo. Marque al menos una como
          tela principal para generar su ficha.
        </p>
        {pocketFabrics.length > 0 && (
          <ul className="mt-3 space-y-2">
            {pocketFabrics.map((i) => (
              <li key={i.id} className="flex items-center justify-between text-sm">
                <span>{i.supply.name}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setUsageMutation.mutate({ supplyItemId: i.id, fabricUsage: 'main' })
                  }
                >
                  Marcar como tela principal
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    );
  }

  const active = sheets.find((s) => s.id === activeId) ?? sheets[0];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">Fichas de piezas por tela</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 border-b border-[var(--color-border)] pb-3">
        {sheets.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveId(s.id)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              s.id === active.id
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'bg-white text-[var(--color-primary)] border-[var(--color-accent-blue-light)] hover:bg-[var(--color-accent-blue-pale)]'
            }`}
          >
            {s.workOrderSupplyItem.supply.name}
          </button>
        ))}
        {pocketFabrics.length > 0 && (
          <span className="text-xs text-[var(--color-text-secondary)] flex items-center pl-2">
            Tela bolsillo: {pocketFabrics.map((p) => p.supply.name).join(', ')}
          </span>
        )}
      </div>

      <SheetEditor
        key={active.id}
        workOrderId={workOrderId}
        sheet={active}
        fabricSupplyItems={fabricSupplyItems}
        onPocketToggle={(supplyItemId, fabricUsage) =>
          setUsageMutation.mutate({ supplyItemId, fabricUsage })
        }
        invalidate={invalidate}
      />
    </Card>
  );
}

// ───────────────────────────────────────────────────────────

interface EditorProps {
  workOrderId: string;
  sheet: FabricPieceSheet;
  fabricSupplyItems: SupplyItem[];
  onPocketToggle: (supplyItemId: string, fabricUsage: string) => void;
  invalidate: () => void;
}

function SheetEditor({ workOrderId, sheet, onPocketToggle, invalidate }: EditorProps) {
  const [header, setHeader] = useState({
    sheetDate: sheet.sheetDate ?? '',
    sizesPlaced: numStr(sheet.sizesPlaced),
    realAverage: numStr(sheet.realAverage),
    markerLength: numStr(sheet.markerLength),
    labeledPiecesNotes: sheet.labeledPiecesNotes ?? '',
    pocketFabricNotes: sheet.pocketFabricNotes ?? '',
    hasBias: sheet.hasBias,
    biasWeight: numStr(sheet.biasWeight),
    hasElastic: sheet.hasElastic,
    hasZipper: sheet.hasZipper,
    zipperWeight: numStr(sheet.zipperWeight),
    hasLuxuryZipper: sheet.hasLuxuryZipper,
    programmedQty: numStr(sheet.programmedQty),
    metersToUse: numStr(sheet.metersToUse),
    leftoverMeters: numStr(sheet.leftoverMeters),
    notes: sheet.notes ?? '',
  });

  const [pieces, setPieces] = useState<FabricPieceSheetPiece[]>(sheet.pieces);
  const [rolls, setRolls] = useState<FabricPieceSheetRoll[]>(sheet.rolls);

  useEffect(() => {
    setPieces(sheet.pieces);
    setRolls(sheet.rolls);
  }, [sheet.id, sheet.pieces, sheet.rolls]);

  const totalMeters = useMemo(
    () => rolls.reduce((sum, r) => sum + (parseFloat(String(r.meters)) || 0), 0),
    [rolls],
  );

  const baseUrl = `/work-orders/${workOrderId}/fabric-piece-sheets/${sheet.id}`;

  // ── Cabecera ──
  const saveHeaderMutation = useMutation({
    mutationFn: async () => {
      await api.patch(baseUrl, {
        sheetDate: header.sheetDate || undefined,
        sizesPlaced: header.sizesPlaced === '' ? undefined : parseInt(header.sizesPlaced, 10),
        realAverage: header.realAverage === '' ? undefined : parseFloat(header.realAverage),
        markerLength: header.markerLength === '' ? undefined : parseFloat(header.markerLength),
        labeledPiecesNotes: header.labeledPiecesNotes || undefined,
        pocketFabricNotes: header.pocketFabricNotes || undefined,
        hasBias: header.hasBias,
        biasWeight: header.biasWeight === '' ? undefined : parseFloat(header.biasWeight),
        hasElastic: header.hasElastic,
        hasZipper: header.hasZipper,
        zipperWeight: header.zipperWeight === '' ? undefined : parseFloat(header.zipperWeight),
        hasLuxuryZipper: header.hasLuxuryZipper,
        programmedQty: header.programmedQty === '' ? undefined : parseInt(header.programmedQty, 10),
        metersToUse: header.metersToUse === '' ? undefined : parseFloat(header.metersToUse),
        leftoverMeters: header.leftoverMeters === '' ? undefined : parseFloat(header.leftoverMeters),
        notes: header.notes || undefined,
      });
    },
    onSuccess: invalidate,
  });

  // ── Piezas ──
  const addPiece = () => {
    setPieces((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        sortOrder: prev.length,
        name: '',
        materialSlot: 1,
        quantity: 1,
        isPair: false,
        imageUrl: null,
      },
    ]);
  };

  const updatePieceLocal = (idx: number, patch: Partial<FabricPieceSheetPiece>) => {
    setPieces((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const persistPieceMutation = useMutation({
    mutationFn: async (piece: FabricPieceSheetPiece) => {
      const payload = {
        name: piece.name,
        materialSlot: piece.materialSlot,
        quantity: piece.quantity,
        isPair: piece.isPair,
        imageUrl: piece.imageUrl ?? undefined,
        sortOrder: piece.sortOrder,
      };
      if (piece.id.startsWith('temp-')) {
        const { data } = await api.post(`${baseUrl}/pieces`, payload);
        return data as FabricPieceSheetPiece;
      }
      const { data } = await api.patch(`${baseUrl}/pieces/${piece.id}`, payload);
      return data as FabricPieceSheetPiece;
    },
    onSuccess: invalidate,
  });

  const removePieceMutation = useMutation({
    mutationFn: async (pieceId: string) => {
      if (pieceId.startsWith('temp-')) return;
      await api.delete(`${baseUrl}/pieces/${pieceId}`);
    },
    onSuccess: invalidate,
  });

  const handlePersistPiece = (idx: number) => {
    const piece = pieces[idx];
    if (!piece.name.trim()) return;
    persistPieceMutation.mutate(piece);
  };

  const handleRemovePiece = (idx: number) => {
    const piece = pieces[idx];
    setPieces((prev) => prev.filter((_, i) => i !== idx));
    removePieceMutation.mutate(piece.id);
  };

  const handlePieceImage = async (idx: number, file: File) => {
    try {
      const dataUrl = await fileToThumbnailDataUrl(file, 320);
      const piece = pieces[idx];
      updatePieceLocal(idx, { imageUrl: dataUrl });
      if (!piece.id.startsWith('temp-')) {
        await api.put(`${baseUrl}/pieces/${piece.id}/image`, { imageUrl: dataUrl });
        invalidate();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cargar imagen');
    }
  };

  // ── Rollos ──
  const addRoll = () => {
    setRolls((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        rollNumber: String(prev.length + 1),
        meters: '',
        sortOrder: prev.length,
      },
    ]);
  };

  const updateRollLocal = (idx: number, patch: Partial<FabricPieceSheetRoll>) => {
    setRolls((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRollLocal = (idx: number) => {
    setRolls((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveRollsMutation = useMutation({
    mutationFn: async () => {
      const items = rolls
        .filter((r) => r.rollNumber.trim() && String(r.meters).trim())
        .map((r, idx) => ({
          rollNumber: r.rollNumber,
          meters: parseFloat(String(r.meters)) || 0,
          sortOrder: idx,
        }));
      await api.put(`${baseUrl}/rolls`, { items });
    },
    onSuccess: invalidate,
  });

  const isPocket = sheet.workOrderSupplyItem.fabricUsage === 'pocket';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Tabla de piezas ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Tabla de piezas</h3>
          <Button size="sm" variant="secondary" onClick={addPiece}>
            <Plus size={14} className="mr-1" />
            Agregar pieza
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-secondary)] border-b">
                <th className="py-2 pr-2 w-10">#</th>
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 pr-2 w-20 text-center">Mat.</th>
                <th className="py-2 pr-2 w-16 text-center">Cant.</th>
                <th className="py-2 pr-2 w-12 text-center">Par</th>
                <th className="py-2 pr-2 w-28">Imagen</th>
                <th className="py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {pieces.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-xs text-[var(--color-text-secondary)]"
                  >
                    Sin piezas registradas. Agregue una para empezar.
                  </td>
                </tr>
              )}
              {pieces.map((p, idx) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-1 pr-2 text-xs text-[var(--color-text-secondary)]">{idx + 1}</td>
                  <td className="py-1 pr-2">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={p.name}
                      placeholder="PRETINA, DELANTERO…"
                      onChange={(e) => updatePieceLocal(idx, { name: e.target.value.toUpperCase() })}
                      onBlur={() => handlePersistPiece(idx)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <select
                      className="w-full border rounded px-1 py-1 text-sm text-center"
                      value={p.materialSlot}
                      onChange={(e) => {
                        updatePieceLocal(idx, { materialSlot: parseInt(e.target.value, 10) });
                      }}
                      onBlur={() => handlePersistPiece(idx)}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={0}>D</option>
                    </select>
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      className="w-full border rounded px-1 py-1 text-sm text-right"
                      value={p.quantity}
                      onChange={(e) =>
                        updatePieceLocal(idx, { quantity: parseInt(e.target.value, 10) || 0 })
                      }
                      onBlur={() => handlePersistPiece(idx)}
                    />
                  </td>
                  <td className="py-1 pr-2 text-center">
                    <input
                      type="checkbox"
                      checked={p.isPair}
                      onChange={(e) => {
                        updatePieceLocal(idx, { isPair: e.target.checked });
                        handlePersistPiece(idx);
                      }}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    {p.imageUrl ? (
                      <ClickableImage
                        src={p.imageUrl}
                        alt={p.name}
                        label={p.name || 'Pieza'}
                        className="h-10 w-10 object-cover rounded border"
                      />
                    ) : (
                      <label className="flex items-center justify-center h-10 w-10 border border-dashed rounded text-[var(--color-text-secondary)] cursor-pointer hover:bg-[var(--color-accent-blue-pale)]">
                        <ImageIcon size={14} />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePieceImage(idx, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </td>
                  <td className="py-1">
                    <button
                      type="button"
                      onClick={() => handleRemovePiece(idx)}
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Cabecera ── */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Datos de corte</h3>
            <div className="flex items-center gap-2">
              {isPocket ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    onPocketToggle(sheet.workOrderSupplyItem.id, 'main')
                  }
                >
                  Marcar como principal
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    onPocketToggle(sheet.workOrderSupplyItem.id, 'pocket')
                  }
                >
                  Es tela bolsillo
                </Button>
              )}
              <Button size="sm" onClick={() => saveHeaderMutation.mutate()} disabled={saveHeaderMutation.isPending}>
                <Save size={14} className="mr-1" />
                Guardar
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Fecha">
              <input
                type="date"
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={header.sheetDate ? header.sheetDate.slice(0, 10) : ''}
                onChange={(e) => setHeader((h) => ({ ...h, sheetDate: e.target.value }))}
              />
            </Field>
            <Field label="Tallas colocadas">
              <input
                type="number"
                min={0}
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={header.sizesPlaced}
                onChange={(e) => setHeader((h) => ({ ...h, sizesPlaced: e.target.value }))}
              />
            </Field>
            <Field label="Promedio real">
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={header.realAverage}
                onChange={(e) => setHeader((h) => ({ ...h, realAverage: e.target.value }))}
              />
            </Field>
            <Field label="Largo del trazo">
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={header.markerLength}
                onChange={(e) => setHeader((h) => ({ ...h, markerLength: e.target.value }))}
              />
            </Field>
            <Field label="Cantidad programada">
              <input
                type="number"
                min={0}
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={header.programmedQty}
                onChange={(e) => setHeader((h) => ({ ...h, programmedQty: e.target.value }))}
              />
            </Field>
            <Field label="Tela bolsillo (notas)">
              <input
                type="text"
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="NO HAY"
                value={header.pocketFabricNotes}
                onChange={(e) => setHeader((h) => ({ ...h, pocketFabricNotes: e.target.value }))}
              />
            </Field>
            <Field label="Piezas etiquetadas">
              <input
                type="text"
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={header.labeledPiecesNotes}
                onChange={(e) => setHeader((h) => ({ ...h, labeledPiecesNotes: e.target.value }))}
              />
            </Field>
            <Field label="Metros a usar">
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={header.metersToUse}
                onChange={(e) => setHeader((h) => ({ ...h, metersToUse: e.target.value }))}
              />
            </Field>
            <Field label="Sobra">
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={header.leftoverMeters}
                onChange={(e) => setHeader((h) => ({ ...h, leftoverMeters: e.target.value }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <CheckboxField
              label="Sesgo"
              checked={header.hasBias}
              onChange={(v) => setHeader((h) => ({ ...h, hasBias: v }))}
            />
            <Field label="Peso sesgo">
              <input
                type="number"
                step="0.01"
                disabled={!header.hasBias}
                className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-50"
                value={header.biasWeight}
                onChange={(e) => setHeader((h) => ({ ...h, biasWeight: e.target.value }))}
              />
            </Field>
            <CheckboxField
              label="Caucho"
              checked={header.hasElastic}
              onChange={(v) => setHeader((h) => ({ ...h, hasElastic: v }))}
            />
            <CheckboxField
              label="Cierre de lujo"
              checked={header.hasLuxuryZipper}
              onChange={(v) => setHeader((h) => ({ ...h, hasLuxuryZipper: v }))}
            />
            <CheckboxField
              label="Cierre"
              checked={header.hasZipper}
              onChange={(v) => setHeader((h) => ({ ...h, hasZipper: v }))}
            />
            <Field label="Peso cierre">
              <input
                type="number"
                step="0.01"
                disabled={!header.hasZipper}
                className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-50"
                value={header.zipperWeight}
                onChange={(e) => setHeader((h) => ({ ...h, zipperWeight: e.target.value }))}
              />
            </Field>
          </div>
        </div>

        {/* ── Rollos ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Rollos</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={addRoll}>
                <Plus size={14} className="mr-1" />
                Agregar rollo
              </Button>
              <Button
                size="sm"
                onClick={() => saveRollsMutation.mutate()}
                disabled={saveRollsMutation.isPending}
              >
                <Save size={14} className="mr-1" />
                Guardar rollos
              </Button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-secondary)] border-b">
                <th className="py-2 pr-2 w-24"># Rollo</th>
                <th className="py-2 pr-2 text-right">Mts</th>
                <th className="py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rolls.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-3 text-center text-xs text-[var(--color-text-secondary)]"
                  >
                    Sin rollos.
                  </td>
                </tr>
              )}
              {rolls.map((r, idx) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-1 pr-2">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={r.rollNumber}
                      onChange={(e) => updateRollLocal(idx, { rollNumber: e.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-full border rounded px-2 py-1 text-sm text-right"
                      value={r.meters}
                      onChange={(e) => updateRollLocal(idx, { meters: e.target.value })}
                    />
                  </td>
                  <td className="py-1">
                    <button
                      type="button"
                      onClick={() => removeRollLocal(idx)}
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                      title="Quitar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="py-2 font-semibold">Total mts</td>
                <td className="py-2 text-right font-mono font-semibold">
                  {totalMeters.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-[var(--color-text-secondary)] mb-1">{label}</span>
      {children}
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
