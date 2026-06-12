import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import api from '../../lib/api';

export interface MeasurementSheetColumn {
  id: string;
  sizeId: string;
  sortOrder: number;
  size?: { id: string; name: string; sortOrder?: number | null };
}

export interface MeasurementSheetCell {
  id: string;
  sheetId: string;
  garmentMeasurementPointId: string;
  sizeId: string;
  valueCm?: string | number | null;
}

export interface MeasurementSheet {
  id: string;
  status: string;
  notes?: string | null;
  columns: MeasurementSheetColumn[];
  cells: MeasurementSheetCell[];
}

interface MeasurementPoint {
  id: string;
  category: string;
  name: string;
  description?: string | null;
  isOptional: boolean;
  sortOrder: number;
}

interface Props {
  workOrderId: string;
  sheet: MeasurementSheet | null;
  hasSizeCurve: boolean;
}

const CATEGORY_ORDER = ['General', 'Superior', 'Centro del cuerpo', 'Inferior'];

const cellKey = (pointId: string, sizeId: string) => `${pointId}::${sizeId}`;

function normalizeValue(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '';
  return String(v);
}

export function WorkOrderMeasurementSheet({ workOrderId, sheet, hasSizeCurve }: Props) {
  const queryClient = useQueryClient();

  const { data: points = [] } = useQuery({
    queryKey: ['garment-measurement-points'],
    queryFn: async () => {
      const { data } = await api.get('/garment-measurement-points');
      return data as MeasurementPoint[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/work-orders/${workOrderId}/measurement-sheet`, {});
    },
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo crear la tabla de medidas';
      alert(msg);
    },
  });

  if (!sheet) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Tabla de medidas</h2>
          <Button
            size="sm"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !hasSizeCurve}
            title={!hasSizeCurve ? 'Define primero la curva de tallas de la OT' : ''}
          >
            <Plus size={14} className="mr-1" />
            Crear tabla de medidas
          </Button>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {hasSizeCurve
            ? 'Aún no se ha generado la tabla de medidas. Al crearla se usarán las tallas de la curva de la OT y los puntos de medida del catálogo.'
            : 'Define primero la curva de tallas de la OT para poder crear la tabla de medidas.'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <MeasurementSheetEditor
        workOrderId={workOrderId}
        sheet={sheet}
        points={points}
        invalidate={invalidate}
      />
    </Card>
  );
}

interface EditorProps {
  workOrderId: string;
  sheet: MeasurementSheet;
  points: MeasurementPoint[];
  invalidate: () => void;
}

function MeasurementSheetEditor({ workOrderId, sheet, points, invalidate }: EditorProps) {
  const sortedColumns = useMemo(() => {
    return [...sheet.columns].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      const sa = a.size?.sortOrder ?? 0;
      const sb = b.size?.sortOrder ?? 0;
      return sa - sb;
    });
  }, [sheet.columns]);

  const groupedPoints = useMemo(() => {
    const map = new Map<string, MeasurementPoint[]>();
    for (const p of points) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    const categoriesInOrder = [
      ...CATEGORY_ORDER.filter((c) => map.has(c)),
      ...Array.from(map.keys()).filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
    return categoriesInOrder.map((category) => ({
      category,
      items: map.get(category) ?? [],
    }));
  }, [points]);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const cell of sheet.cells) {
      initial[cellKey(cell.garmentMeasurementPointId, cell.sizeId)] = normalizeValue(cell.valueCm);
    }
    return initial;
  });

  const [dirty, setDirty] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const cell of sheet.cells) {
      next[cellKey(cell.garmentMeasurementPointId, cell.sizeId)] = normalizeValue(cell.valueCm);
    }
    setValues(next);
    setDirty(new Set());
  }, [sheet.id, sheet.cells]);

  const totalCells = groupedPoints.reduce((sum, g) => sum + g.items.length, 0) * sortedColumns.length;
  const filledCells = Object.values(values).filter((v) => v.trim() !== '').length;
  const completion = totalCells === 0 ? 0 : Math.round((filledCells / totalCells) * 100);

  const updateCell = (pointId: string, sizeId: string, raw: string) => {
    const key = cellKey(pointId, sizeId);
    setValues((prev) => ({ ...prev, [key]: raw }));
    setDirty((prev) => new Set(prev).add(key));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (dirty.size === 0) return;
      const cells = Array.from(dirty).map((key) => {
        const [garmentMeasurementPointId, sizeId] = key.split('::');
        const raw = values[key];
        const trimmed = raw.trim();
        const valueCm = trimmed === '' ? null : Number(trimmed);
        return { garmentMeasurementPointId, sizeId, valueCm };
      });
      await api.put(`/work-orders/${workOrderId}/measurement-sheet/cells`, { cells });
    },
    onSuccess: () => {
      setDirty(new Set());
      invalidate();
    },
  });

  if (sortedColumns.length === 0) {
    return (
      <div>
        <h2 className="font-semibold text-sm mb-2">Tabla de medidas</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          La tabla no tiene tallas. Agrega tallas a la curva de la OT y recrea la tabla.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="font-semibold text-sm">Tabla de medidas</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Medidas promedio por talla (cm). Completitud: <strong>{completion}%</strong> (
            {filledCells}/{totalCells})
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={dirty.size === 0 || saveMutation.isPending}
        >
          <Save size={14} className="mr-1" />
          Guardar{dirty.size > 0 ? ` (${dirty.size})` : ''}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--color-accent-blue-pale)]">
              <th className="text-left py-2 px-2 sticky left-0 bg-[var(--color-accent-blue-pale)] z-10 w-40">
                Categoría
              </th>
              <th className="text-left py-2 px-2 sticky left-40 bg-[var(--color-accent-blue-pale)] z-10">
                Medida
              </th>
              {sortedColumns.map((col) => (
                <th key={col.id} className="py-2 px-2 text-center w-24">
                  {col.size?.name ?? '—'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedPoints.map(({ category, items }) =>
              items.map((point, idx) => (
                <tr
                  key={point.id}
                  className={`border-b last:border-0 ${
                    point.isOptional ? 'text-[var(--color-text-secondary)]' : ''
                  }`}
                >
                  {idx === 0 ? (
                    <td
                      rowSpan={items.length}
                      className="align-top py-2 px-2 font-semibold text-xs uppercase tracking-wide bg-[var(--color-accent-blue-pale)]/40 border-r"
                    >
                      {category}
                    </td>
                  ) : null}
                  <td className="py-1 px-2" title={point.description ?? undefined}>
                    {point.name}
                    {point.isOptional && (
                      <span className="ml-1 text-[10px] text-[var(--color-text-secondary)]">
                        (opcional)
                      </span>
                    )}
                  </td>
                  {sortedColumns.map((col) => {
                    const key = cellKey(point.id, col.sizeId);
                    const isDirty = dirty.has(key);
                    return (
                      <td key={col.id} className="py-1 px-1">
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          className={`w-full border rounded px-2 py-1 text-sm text-right ${
                            isDirty ? 'border-[var(--color-primary)] bg-yellow-50' : ''
                          }`}
                          value={values[key] ?? ''}
                          onChange={(e) => updateCell(point.id, col.sizeId, e.target.value)}
                        />
                      </td>
                    );
                  })}
                </tr>
              )),
            )}
            {groupedPoints.length === 0 && (
              <tr>
                <td
                  colSpan={sortedColumns.length + 2}
                  className="py-6 text-center text-xs text-[var(--color-text-secondary)]"
                >
                  No hay puntos de medida en el catálogo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
