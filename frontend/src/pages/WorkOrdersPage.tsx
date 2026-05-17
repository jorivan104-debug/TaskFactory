import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { Plus, X } from 'lucide-react';
import api from '../lib/api';

interface WORow {
  id: string;
  code: string;
  title?: string;
  status: string;
  productionType?: string;
  currentStateKey?: string;
  blueprintSnapshotJson?: { nodes?: { id: string; data?: { label?: string } }[] };
  workOrderType?: { id: string; code: string; name: string };
  workSite?: { id: string; code: string; name: string };
}

const columns = [
  { key: 'code', header: 'Código' },
  { key: 'title', header: 'Título', render: (row: WORow) => row.title ?? '—' },
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
    key: 'currentStateKey',
    header: 'Estado flujo',
    render: (row: WORow) => {
      if (!row.currentStateKey) return '—';
      const node = row.blueprintSnapshotJson?.nodes?.find((n) => n.id === row.currentStateKey);
      return node?.data?.label ?? row.currentStateKey;
    },
  },
  {
    key: 'status',
    header: 'Estado',
    render: (row: WORow) => <StatusBadge status={row.status} />,
  },
];

interface FormState {
  workSiteId: string;
  workOrderTypeId: string;
  code: string;
  title: string;
  productionType: string;
}

const emptyForm: FormState = {
  workSiteId: '',
  workOrderTypeId: '',
  code: '',
  title: '',
  productionType: '',
};

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

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

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        code: form.code,
        workSiteId: form.workSiteId,
      };
      if (form.workOrderTypeId) payload.workOrderTypeId = form.workOrderTypeId;
      if (form.title) payload.title = form.title;
      if (form.productionType) payload.productionType = form.productionType;
      const { data } = await api.post('/work-orders', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setModalOpen(false);
      setForm(emptyForm);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg p-6 relative">
            <button
              onClick={() => { setModalOpen(false); setFormError(null); }}
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
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => { setModalOpen(false); setFormError(null); }}>
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
