import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pencil, Ban, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { ActiveBadge } from '../components/settings/CatalogCrudPage';
import api from '../lib/api';

const MOVEMENT_TYPES = [
  { value: 'adjustment', label: 'Ajuste' },
  { value: 'inbound', label: 'Entrada' },
  { value: 'outbound', label: 'Salida' },
  { value: 'return', label: 'Devolución' },
];

const movementTypeLabel = (t: string) =>
  MOVEMENT_TYPES.find((o) => o.value === t)?.label ?? t;

interface MovementRow {
  id: string;
  movementType: string;
  quantity: string | number;
  occurredAt: string;
  isActive: boolean;
  notes?: string;
  warehouse?: { id: string; name: string };
  unitOfMeasure?: { code: string };
  createdBy?: { fullName: string };
}

interface SupplyDetail {
  id: string;
  name: string;
  sku?: string;
  stockOnHand: string | number;
  isActive: boolean;
  supplyType?: { name: string };
  unitOfMeasure?: { id: string; code: string; name: string };
  stockLots?: { warehouse?: { name: string }; quantityOnHand: string | number }[];
}

interface MovementForm {
  warehouseId: string;
  movementType: string;
  quantity: string;
  unitOfMeasureId: string;
  occurredAt: string;
  notes: string;
  lotCode: string;
}

const emptyMovementForm = (unitId = ''): MovementForm => ({
  warehouseId: '',
  movementType: 'adjustment',
  quantity: '',
  unitOfMeasureId: unitId,
  occurredAt: new Date().toISOString().slice(0, 16),
  notes: '',
  lotCode: '',
});

function formatQty(v: string | number) {
  const n = Number(v);
  return Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function displaySignedQty(row: MovementRow) {
  const q = Number(row.quantity);
  if (row.movementType === 'adjustment') return formatQty(q);
  if (row.movementType === 'outbound') return `-${formatQty(q)}`;
  return `+${formatQty(q)}`;
}

export function InventorySupplyDetailPage() {
  const { supplyId } = useParams<{ supplyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MovementForm>(emptyMovementForm());
  const [formError, setFormError] = useState<string | null>(null);

  const { data: supply, isLoading } = useQuery({
    queryKey: ['inventory-item', supplyId],
    queryFn: async () => {
      const { data } = await api.get(`/inventory/items/${supplyId}`);
      return data as SupplyDetail;
    },
    enabled: !!supplyId,
  });

  const { data: movements = [] } = useQuery({
    queryKey: ['inventory-movements', supplyId],
    queryFn: async () => {
      const { data } = await api.get(`/inventory/items/${supplyId}/movements`);
      return data as MovementRow[];
    },
    enabled: !!supplyId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data } = await api.get('/warehouses');
      return data as { id: string; name: string }[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory-item', supplyId] });
    queryClient.invalidateQueries({ queryKey: ['inventory-movements', supplyId] });
    queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        warehouseId: form.warehouseId,
        supplyId,
        movementType: form.movementType,
        quantity: Number(form.quantity),
        unitOfMeasureId: form.unitOfMeasureId,
        notes: form.notes || undefined,
        lotCode: form.lotCode || undefined,
        occurredAt: form.occurredAt
          ? new Date(form.occurredAt).toISOString()
          : undefined,
      };
      if (editingId) {
        await api.patch(`/inventory/movements/${editingId}`, payload);
      } else {
        await api.post('/inventory/movements', payload);
      }
    },
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message ?? 'Error al guardar';
      setFormError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/inventory/movements/${id}/deactivate`),
    onSuccess: () => invalidate(),
    onError: (err: unknown) => {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'No se pudo desactivar',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/movements/${id}`),
    onSuccess: () => invalidate(),
    onError: (err: unknown) => {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'No se pudo eliminar',
      );
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyMovementForm(supply?.unitOfMeasure?.id ?? ''));
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: MovementRow) => {
    if (!row.isActive) return;
    setEditingId(row.id);
    const qty =
      row.movementType === 'adjustment'
        ? String(row.quantity)
        : String(row.quantity);
    setForm({
      warehouseId: row.warehouse?.id ?? '',
      movementType: row.movementType,
      quantity: qty,
      unitOfMeasureId: supply?.unitOfMeasure?.id ?? '',
      occurredAt: row.occurredAt.slice(0, 16),
      notes: row.notes ?? '',
      lotCode: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  if (isLoading || !supply) {
    return (
      <div className="p-8 text-center text-[var(--color-text-secondary)]">Cargando...</div>
    );
  }

  const movementColumns = [
    {
      key: 'occurredAt',
      header: 'Fecha',
      render: (row: MovementRow) =>
        new Date(row.occurredAt).toLocaleString(undefined, {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
    },
    {
      key: 'movementType',
      header: 'Tipo',
      render: (row: MovementRow) => movementTypeLabel(row.movementType),
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      render: (row: MovementRow) => (
        <span className="font-mono">{displaySignedQty(row)}</span>
      ),
    },
    {
      key: 'warehouse',
      header: 'Almacén',
      render: (row: MovementRow) => row.warehouse?.name ?? '—',
    },
    { key: 'notes', header: 'Notas', render: (row: MovementRow) => row.notes ?? '—' },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row: MovementRow) => <ActiveBadge isActive={row.isActive} />,
    },
    {
      key: '_actions',
      header: '',
      render: (row: MovementRow) => (
        <div className="flex gap-1 justify-end">
          {row.isActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(row);
              }}
              className="p-1.5 rounded hover:bg-[var(--color-accent-blue-pale)]"
              title="Editar"
            >
              <Pencil size={16} />
            </button>
          )}
          {row.isActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('¿Desactivar este movimiento? Se revertirá el stock.')) {
                  deactivateMutation.mutate(row.id);
                }
              }}
              className="p-1.5 rounded hover:bg-red-50 text-red-600"
              title="Desactivar"
            >
              <Ban size={16} />
            </button>
          )}
          {!row.isActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('¿Eliminar permanentemente este movimiento?')) {
                  deleteMutation.mutate(row.id);
                }
              }}
              className="p-1.5 rounded hover:bg-red-50 text-red-600"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motionlessHeader navigate={navigate} supply={supply} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <h2 className="font-semibold text-sm mb-3">Resumen</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-secondary)]">Stock total</dt>
              <dd className="font-mono font-medium">{formatQty(supply.stockOnHand)}</dd>
            </div>
            <motionlessSummaryRow label="Tipo" value={supply.supplyType?.name} />
            <motionlessSummaryRow
              label="Unidad"
              value={
                supply.unitOfMeasure
                  ? `${supply.unitOfMeasure.code} (${supply.unitOfMeasure.name})`
                  : undefined
              }
            />
            {supply.sku && (
              <motionlessSummaryRow label="SKU" value={supply.sku} />
            )}
          </dl>
          {supply.stockLots && supply.stockLots.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                Por almacén
              </p>
              <ul className="text-sm space-y-1">
                {supply.stockLots.map((lot, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{lot.warehouse?.name ?? '—'}</span>
                    <span className="font-mono">{formatQty(lot.quantityOnHand)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-0 overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-sm">Movimientos de inventario</h2>
            <Button size="sm" onClick={openCreate}>
              <Plus size={14} className="mr-1" />
              Ajuste / movimiento
            </Button>
          </div>
          <DataTable columns={movementColumns} data={movements} />
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 text-[var(--color-text-secondary)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar movimiento' : 'Nuevo movimiento'}
            </h2>
            {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}

            <div className="space-y-3">
              <Field label="Almacén *">
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.warehouseId}
                  onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
                >
                  <option value="">Seleccionar</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo *">
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.movementType}
                  onChange={(e) => setForm((f) => ({ ...f, movementType: e.target.value }))}
                >
                  {MOVEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={
                  form.movementType === 'adjustment'
                    ? 'Cantidad (+/-) *'
                    : 'Cantidad *'
                }
              >
                <input
                  type="number"
                  step="any"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </Field>
              <Field label="Fecha *">
                <input
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.occurredAt}
                  onChange={(e) => setForm((f) => ({ ...f, occurredAt: e.target.value }))}
                />
              </Field>
              <Field label="Lote (opcional)">
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.lotCode}
                  onChange={(e) => setForm((f) => ({ ...f, lotCode: e.target.value }))}
                />
              </Field>
              <Field label="Notas">
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </Field>
            </div>

            <motionlessModalFooter
              closeModal={closeModal}
              saveMutation={saveMutation}
              form={form}
              editingId={editingId}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

function motionlessHeader({
  navigate,
  supply,
}: {
  navigate: (path: string) => void;
  supply: SupplyDetail;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate('/inventory')}
        className="p-1 rounded hover:bg-[var(--color-accent-blue-pale)]"
      >
        <ArrowLeft size={20} />
      </button>
      <motionlessHeaderTitle supply={supply} />
    </div>
  );
}

function motionlessHeaderTitle({ supply }: { supply: SupplyDetail }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{supply.name}</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {supply.supplyType?.name ?? 'Insumo'} · Stock: {formatQty(supply.stockOnHand)}{' '}
        {supply.unitOfMeasure?.code ?? ''}
      </p>
    </div>
  );
}

function motionlessSummaryRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <dt className="text-[var(--color-text-secondary)]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function motionlessModalFooter({
  closeModal,
  saveMutation,
  form,
  editingId,
}: {
  closeModal: () => void;
  saveMutation: { isPending: boolean; mutate: () => void };
  form: MovementForm;
  editingId: string | null;
}) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <Button variant="secondary" onClick={closeModal}>
        Cancelar
      </Button>
      <Button
        onClick={() => saveMutation.mutate()}
        disabled={
          saveMutation.isPending ||
          !form.warehouseId ||
          !form.quantity ||
          !form.unitOfMeasureId
        }
      >
        {editingId ? 'Guardar' : 'Registrar'}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
