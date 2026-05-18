import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../lib/api';

export interface SizeCurveRow {
  sizeId: string;
  programmedQty: string;
  cutQty: string;
}

interface Props {
  value: SizeCurveRow[];
  onChange: (rows: SizeCurveRow[]) => void;
  readOnly?: boolean;
}

export function SizeCurveEditor({ value, onChange, readOnly = false }: Props) {
  const { data: sizes = [] } = useQuery({
    queryKey: ['sizes'],
    queryFn: async () => {
      const { data } = await api.get('/sizes');
      return data as { id: string; name: string }[];
    },
  });

  const [rows, setRows] = useState<SizeCurveRow[]>(value);

  useEffect(() => {
    setRows(value);
  }, [value]);

  const sync = (next: SizeCurveRow[]) => {
    setRows(next);
    onChange(next);
  };

  const addRow = () => {
    sync([...rows, { sizeId: '', programmedQty: '', cutQty: '0' }]);
  };

  const updateRow = (index: number, patch: Partial<SizeCurveRow>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    sync(next);
  };

  const removeRow = (index: number) => {
    sync(rows.filter((_, i) => i !== index));
  };

  if (readOnly && rows.length === 0) {
    return <p className="text-xs text-[var(--color-text-secondary)]">Sin curva de tallas</p>;
  }

  return (
    <div className="space-y-2">
      {rows.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--color-text-secondary)] border-b">
              <th className="py-1 pr-2">Talla</th>
              <th className="py-1 pr-2 text-right">Programadas</th>
              <th className="py-1 pr-2 text-right">Cortadas</th>
              {!readOnly && <th className="py-1 w-8" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-1 pr-2">
                  {readOnly ? (
                    sizes.find((s) => s.id === row.sizeId)?.name ?? row.sizeId
                  ) : (
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={row.sizeId}
                      onChange={(e) => updateRow(i, { sizeId: e.target.value })}
                    >
                      <option value="">Talla...</option>
                      {sizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="py-1 pr-2 text-right">
                  {readOnly ? (
                    row.programmedQty
                  ) : (
                    <input
                      type="number"
                      min={0}
                      className="w-20 border rounded px-2 py-1 text-sm text-right ml-auto block"
                      value={row.programmedQty}
                      onChange={(e) => updateRow(i, { programmedQty: e.target.value })}
                    />
                  )}
                </td>
                <td className="py-1 pr-2 text-right">
                  {readOnly ? (
                    row.cutQty
                  ) : (
                    <input
                      type="number"
                      min={0}
                      className="w-20 border rounded px-2 py-1 text-sm text-right ml-auto block"
                      value={row.cutQty}
                      onChange={(e) => updateRow(i, { cutQty: e.target.value })}
                    />
                  )}
                </td>
                {!readOnly && (
                  <td className="py-1">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!readOnly && (
        <button
          type="button"
          onClick={addRow}
          className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          <Plus size={14} />
          Agregar talla
        </button>
      )}
    </div>
  );
}
