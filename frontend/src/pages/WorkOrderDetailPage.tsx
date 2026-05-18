import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Save } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SizeCurveEditor, type SizeCurveRow } from '../components/work-orders/SizeCurveEditor';
import { UrgencyBadge } from '../components/work-orders/UrgencyBadge';
import { formatMoney, lineCost } from '../lib/money';
import api from '../lib/api';

interface GarmentRef {
  id: string;
  code?: string;
  referenceType?: string;
  serie?: string;
  title?: string;
  brand?: { id: string; name: string };
  silhouette?: { id: string; name: string };
  garmentImageUrl1?: string | null;
  garmentImageUrl2?: string | null;
  garmentImageUrl3?: string | null;
  referenceCost?: string | number;
  totalSizesCount?: number;
  programmedGarmentsQty?: number;
  cutGarmentsQty?: number;
}

interface SizeCurveItem {
  id: string;
  sizeId: string;
  programmedQty: number;
  cutQty: number;
  size?: { id: string; name: string };
}

interface SupplyItemRow {
  id: string;
  supplyId: string;
  quantityPerGarment: string | number;
  unitCost: string | number;
  requiredQty: string | number;
  supply: { id: string; name: string; sku?: string; unitOfMeasure?: { code: string } };
}

interface WODetail {
  id: string;
  code: string;
  title?: string;
  status: string;
  urgency?: string;
  supplyCostTotal?: string | number;
  productionType?: string;
  workOrderType?: { name: string };
  workSite?: { name: string };
  garmentReference?: GarmentRef;
  sizeCurve?: SizeCurveItem[];
  supplyItems?: SupplyItemRow[];
  logs: { id: string; entryType: string; summary?: string; performedAt: string }[];
  taskAssignments: { id: string; description?: string; status: string }[];
}

const referenceTypeLabel = (t?: string) => {
  if (t === 'muestra') return 'Muestra';
  if (t === 'produccion') return 'Producción';
  return t ?? '—';
};

function toCurveRows(items: SizeCurveItem[]): SizeCurveRow[] {
  return items.map((i) => ({
    sizeId: i.sizeId,
    programmedQty: String(i.programmedQty),
    cutQty: String(i.cutQty),
  }));
}

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingCurve, setEditingCurve] = useState(false);
  const [curveRows, setCurveRows] = useState<SizeCurveRow[]>([]);

  const { data: wo, isLoading } = useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const { data } = await api.get(`/work-orders/${id}`);
      return data as WODetail;
    },
    enabled: !!id,
  });

  const saveCurveMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/work-orders/${id}/size-curve`, {
        items: curveRows
          .filter((r) => r.sizeId && r.programmedQty !== '')
          .map((r, idx) => ({
            sizeId: r.sizeId,
            programmedQty: parseInt(r.programmedQty, 10) || 0,
            cutQty: parseInt(r.cutQty, 10) || 0,
            sortOrder: idx,
          })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', id] });
      setEditingCurve(false);
    },
  });

  if (isLoading || !wo) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Cargando...</div>;
  }

  const startEditCurve = () => {
    setCurveRows(toCurveRows(wo.sizeCurve ?? []));
    setEditingCurve(true);
  };

  const photos = wo.garmentReference
    ? [
        { label: 'Frontal', src: wo.garmentReference.garmentImageUrl1 },
        { label: 'Trasera', src: wo.garmentReference.garmentImageUrl2 },
        { label: 'Lateral', src: wo.garmentReference.garmentImageUrl3 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/work-orders')}
          className="p-1 rounded hover:bg-[var(--color-accent-blue-pale)]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{wo.code}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {wo.title ?? ''} {wo.workOrderType ? `— ${wo.workOrderType.name}` : ''}
            {wo.workSite ? ` · ${wo.workSite.name}` : ''}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <UrgencyBadge urgency={wo.urgency} />
          {wo.productionType && <StatusBadge status={wo.productionType} />}
          <StatusBadge status={wo.status} />
        </div>
      </div>

      {wo.garmentReference && photos.some((p) => p.src) && (
        <Card className="p-4">
          <h2 className="font-semibold text-sm mb-3">Fotos de la referencia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.label} className="text-center">
                <p className="text-xs text-[var(--color-text-secondary)] mb-2">{photo.label}</p>
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="max-h-52 w-full object-contain mx-auto rounded border"
                  />
                ) : (
                  <p className="text-sm text-gray-300 py-12 border border-dashed rounded">Sin imagen</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-sm mb-3">Referencia de prenda</h2>
          {wo.garmentReference ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-[var(--color-text-secondary)]">ID</dt>
              <dd className="font-mono">{wo.garmentReference.code ?? '—'}</dd>
              <dt className="text-[var(--color-text-secondary)]">Tipo</dt>
              <dd>{referenceTypeLabel(wo.garmentReference.referenceType)}</dd>
              <dt className="text-[var(--color-text-secondary)]">Serie</dt>
              <dd>{wo.garmentReference.serie ?? '—'}</dd>
              <dt className="text-[var(--color-text-secondary)]">Marca</dt>
              <dd>{wo.garmentReference.brand?.name ?? '—'}</dd>
              <dt className="text-[var(--color-text-secondary)]">Silueta</dt>
              <dd>{wo.garmentReference.silhouette?.name ?? '—'}</dd>
              {wo.garmentReference.referenceCost != null && (
                <>
                  <dt className="text-[var(--color-text-secondary)]">Costo ref. catálogo</dt>
                  <dd className="font-mono">${formatMoney(wo.garmentReference.referenceCost)}</dd>
                </>
              )}
            </dl>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">Sin referencia</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Curva de tallas</h2>
            {!editingCurve ? (
              <Button size="sm" variant="secondary" onClick={startEditCurve}>
                <Pencil size={14} className="mr-1" />
                Editar
              </Button>
            ) : (
              <Button size="sm" onClick={() => saveCurveMutation.mutate()} disabled={saveCurveMutation.isPending}>
                <Save size={14} className="mr-1" />
                Guardar
              </Button>
            )}
          </div>
          {editingCurve ? (
            <SizeCurveEditor value={curveRows} onChange={setCurveRows} />
          ) : (
            <>
              <SizeCurveEditor value={toCurveRows(wo.sizeCurve ?? [])} onChange={() => {}} readOnly />
              {wo.garmentReference && wo.sizeCurve && wo.sizeCurve.length > 0 && (
                <div className="mt-2 pt-2 border-t text-xs text-[var(--color-text-secondary)] flex gap-4">
                  <span>
                    Tallas: <strong>{wo.garmentReference.totalSizesCount ?? wo.sizeCurve.length}</strong>
                  </span>
                  <span>
                    Programadas: <strong>{wo.garmentReference.programmedGarmentsQty ?? 0}</strong>
                  </span>
                  <span>
                    Cortadas: <strong>{wo.garmentReference.cutGarmentsQty ?? 0}</strong>
                  </span>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Insumos de la orden</h2>
          <p className="text-sm font-semibold">
            Costo OT: <span className="font-mono text-[var(--color-primary)]">${formatMoney(wo.supplyCostTotal)}</span>
          </p>
        </div>
        {wo.supplyItems && wo.supplyItems.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-secondary)] border-b">
                <th className="py-2">Insumo</th>
                <th className="py-2 text-right">Cant/prenda</th>
                <th className="py-2 text-right">Valor unit.</th>
                <th className="py-2 text-right">Requerido</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {wo.supplyItems.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="py-2">{row.supply.name}</td>
                  <td className="py-2 text-right font-mono">{Number(row.quantityPerGarment)}</td>
                  <td className="py-2 text-right font-mono">${formatMoney(row.unitCost)}</td>
                  <td className="py-2 text-right font-mono">{Number(row.requiredQty)}</td>
                  <td className="py-2 text-right font-mono">
                    ${formatMoney(lineCost(row.requiredQty, row.unitCost))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-[var(--color-text-secondary)]">Sin insumos asignados</p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-sm mb-3">Tareas asignadas</h2>
          {wo.taskAssignments.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">Sin tareas</p>
          ) : (
            <ul className="space-y-2">
              {wo.taskAssignments.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span>{t.description ?? '—'}</span>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-sm mb-3">Bitácora</h2>
          {wo.logs.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">Sin registros</p>
          ) : (
            <ul className="space-y-3">
              {wo.logs.map((log) => (
                <li key={log.id} className="border-l-2 border-[var(--color-border)] pl-3">
                  <p className="text-sm font-medium">{log.summary ?? log.entryType}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(log.performedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
