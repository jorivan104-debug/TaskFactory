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
  currentStateKey?: string;
  blueprintSnapshotJson?: { nodes?: { id: string; data?: { label?: string } }[] };
  workOrderType?: { id: string; code: string; name: string };
  productionOrder?: { id: string; code: string };
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
    key: 'productionOrder',
    header: 'OP',
    render: (row: WORow) => row.productionOrder?.code ?? '—',
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

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ productionOrderId: '', workOrderTypeId: '', workSiteId: '', code: '', title: '' });
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

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = { code: form.code };
      if (form.productionOrderId) payload.productionOrderId = form.productionOrderId;
      if (form.workOrderTypeId) payload.workOrderTypeId = form.workOrderTypeId;
      if (form.workSiteId) payload.workSiteId = form.workSiteId;
      if (form.title) payload.title = form.title;
      const { data } = await api.post('/work-orders', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setModalOpen(false);
      setForm({ productionOrderId: '', workOrderTypeId: '', workSiteId: '', code: '', title: '' });
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
          Nueva orden de trabajo
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          onRowClick={(row) => navigate(`/work-orders/${(row as WORow).id}`)}
        />
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Nueva orden de trabajo</h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-3"
            >
              <label className="block text-sm font-medium">
                Código *
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Título
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-medium">
                ID Orden de producción *
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={form.productionOrderId}
                  onChange={(e) => setForm((f) => ({ ...f, productionOrderId: e.target.value }))}
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Tipo de OT
                <select
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={form.workOrderTypeId}
                  onChange={(e) => setForm((f) => ({ ...f, workOrderTypeId: e.target.value }))}
                >
                  <option value="">— Sin tipo —</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Guardar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
