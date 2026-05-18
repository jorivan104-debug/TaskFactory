import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { Plus, X } from 'lucide-react';
import api from '../lib/api';
import { SizeCurveEditor, type SizeCurveRow } from '../components/work-orders/SizeCurveEditor';
import { UrgencyBadge } from '../components/work-orders/UrgencyBadge';

interface WORow {
  id: string;
  code: string;
  title?: string;
  status: string;
  urgency?: string;
  productionType?: string;
  workOrderType?: { id: string; code: string; name: string };
  workSite?: { id: string; code: string; name: string };
}

const columns = [
  { key: 'code', header: 'Código' },
  { key: 'title', header: 'Título', render: (row: WORow) => row.title ?? '—' },
  {
    key: 'urgency',
    header: 'Urgencia',
    render: (row: WORow) => <UrgencyBadge urgency={row.urgency} />,
  },
  {
    key: 'workOrderType',
    header: 'Tipo',
    render: (row: WORow) => row.workOrderType?.name ?? '—',
  },
  {
    key: 'workSite',
    header: 'Planta',
    render: (row: WORow) => row.workSite?.name ?? '—',
  },
  {
    key: 'productionType',
    header: 'Prod.',
    render: (row: WORow) => <StatusBadge status={row.productionType ?? 'draft'} />,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (row: WORow) => <StatusBadge status={row.status} />,
  },
];

interface CatalogRef {
  id: string;
  code: string;
  title?: string;
  imageUrl?: string | null;
  garmentImageUrl1?: string | null;
}

interface FormState {
  workSiteId: string;
  workOrderTypeId: string;
  code: string;
  title: string;
  productionType: string;
  catalogGarmentReferenceId: string;
  urgency: string;
}

const emptyForm: FormState = {
  workSiteId: '',
  workOrderTypeId: '',
  code: '',
  title: '',
  productionType: '',
  catalogGarmentReferenceId: '',
  urgency: 'normal',
};

const emptyCurve: SizeCurveRow[] = [];

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [sizeCurve, setSizeCurve] = useState<SizeCurveRow[]>(emptyCurve);

  const { data: rows = [] } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const { data } = await api.get('/work-orders');
      return data as WORow[];
    },
  });

  const { data: types = [] } = useQuery({
    queryKey: ['work-order-types'],
    queryFn: async () => {
      const { data } = await api.get('/work-order-types');
      return data as { id: string; code: string; name: string }[];
    },
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['work-sites'],
    queryFn: async () => {
      const { data } = await api.get('/work-sites');
      return data as { id: string; code: string; name: string }[];
    },
  });

  const { data: catalogRefs = [] } = useQuery({
    queryKey: ['garment-references', 'catalog'],
    queryFn: async () => {
      const { data } = await api.get('/garment-references', { params: { isActive: true } });
      return data as CatalogRef[];
    },
  });

  const selectedCatalogRef = catalogRefs.find((r) => r.id === form.catalogGarmentReferenceId);

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        code: form.code,
        workSiteId: form.workSiteId,
      };
      if (form.workOrderTypeId) payload.workOrderTypeId = form.workOrderTypeId;
      if (form.title) payload.title = form.title;
      if (form.productionType) payload.productionType = form.productionType;
      if (form.catalogGarmentReferenceId) {
        payload.catalogGarmentReferenceId = form.catalogGarmentReferenceId;
      }
      if (form.urgency) payload.urgency = form.urgency;
      const curveItems = sizeCurve
        .filter((r) => r.sizeId && r.programmedQty !== '')
        .map((r, idx) => ({
          sizeId: r.sizeId,
          programmedQty: parseInt(r.programmedQty, 10) || 0,
          cutQty: parseInt(r.cutQty, 10) || 0,
          sortOrder: idx,
        }));
      if (curveItems.length) payload.sizeCurve = curveItems;
      const { data } = await api.post('/work-orders', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setModalOpen(false);
      setForm(emptyForm);
      setSizeCurve(emptyCurve);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ?? 'Error al crear';
      setFormError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Órdenes de trabajo</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Nueva OT
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          onRowClick={(row) => navigate(`/work-orders/${row.id}`)}
        />
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setModalOpen(false);
                setFormError(null);
                setForm(emptyForm);
                setSizeCurve(emptyCurve);
              }}
              className="absolute top-3 right-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Nueva orden de trabajo</h2>

            {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Código *</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Planta *</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.workSiteId}
                  onChange={(e) => setForm((f) => ({ ...f, workSiteId: e.target.value }))}
                >
                  <option value="">Seleccionar planta</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de OT</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.workOrderTypeId}
                  onChange={(e) => setForm((f) => ({ ...f, workOrderTypeId: e.target.value }))}
                >
                  <option value="">Sin tipo</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de producción</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.productionType}
                  onChange={(e) => setForm((f) => ({ ...f, productionType: e.target.value }))}
                >
                  <option value="">—</option>
                  <option value="development">Desarrollo</option>
                  <option value="batch_production">Producción en lotes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urgencia</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.urgency}
                  onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))}
                >
                  <option value="bajo">Bajo</option>
                  <option value="normal">Normal</option>
                  <option value="alto">Alto</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Referencia de catálogo</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.catalogGarmentReferenceId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, catalogGarmentReferenceId: e.target.value }))
                  }
                >
                  <option value="">Sin referencia</option>
                  {catalogRefs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} {r.title ? `— ${r.title}` : ''}
                    </option>
                  ))}
                </select>
                {selectedCatalogRef && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded border bg-gray-50">
                    {(selectedCatalogRef.imageUrl ?? selectedCatalogRef.garmentImageUrl1) ? (
                      <img
                        src={selectedCatalogRef.imageUrl ?? selectedCatalogRef.garmentImageUrl1 ?? ''}
                        alt=""
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : null}
                    <span className="text-sm font-mono">{selectedCatalogRef.code}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-3">
                <label className="block text-sm font-semibold mb-2">Curva de tallas</label>
                <SizeCurveEditor value={sizeCurve} onChange={setSizeCurve} />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setModalOpen(false);
                  setFormError(null);
                  setForm(emptyForm);
                  setSizeCurve(emptyCurve);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.code || !form.workSiteId}
              >
                Crear
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
