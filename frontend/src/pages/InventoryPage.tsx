import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { ActiveBadge } from '../components/settings/CatalogCrudPage';
import { Plus, X } from 'lucide-react';
import api from '../lib/api';
import { formatMoney } from '../lib/money';

interface SupplyItem {
  id: string;
  name: string;
  sku?: string;
  stockOnHand: string | number;
  stockRequested: string | number;
  stockShortage: string | number;
  purchaseUnitPrice?: string | number | null;
  isActive: boolean;
  supplyType?: { name: string };
  unitOfMeasure?: { code: string; name: string };
}

interface FormState {
  name: string;
  supplyTypeId: string;
  unitOfMeasureId: string;
  sku: string;
  warehouseId: string;
  initialQuantity: string;
  initialNotes: string;
}

const emptyForm: FormState = {
  name: '',
  supplyTypeId: '',
  unitOfMeasureId: '',
  sku: '',
  warehouseId: '',
  initialQuantity: '',
  initialNotes: '',
};

function formatQty(v: string | number) {
  const n = Number(v);
  return Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function InventoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<'all' | 'active' | 'inactive'>('active');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterDisponible, setFilterDisponible] = useState(false);
  const [filterFaltante, setFilterFaltante] = useState(false);

  const inventoryParams = () => {
    const params: Record<string, string | boolean> = {};
    if (filterEstado === 'active') params.isActive = true;
    if (filterEstado === 'inactive') params.isActive = false;
    if (filterTipo) params.supplyTypeId = filterTipo;
    if (filterDisponible) params.disponible = true;
    if (filterFaltante) params.faltante = true;
    return params;
  };

  const { data: rows = [] } = useQuery({
    queryKey: ['inventory-items', filterEstado, filterTipo, filterDisponible, filterFaltante],
    queryFn: async () => {
      const { data } = await api.get('/inventory/items', { params: inventoryParams() });
      return data as SupplyItem[];
    },
  });

  const { data: supplyTypes = [] } = useQuery({
    queryKey: ['supply-types'],
    queryFn: async () => {
      const { data } = await api.get('/supply-types');
      return data as { id: string; name: string }[];
    },
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units-of-measure'],
    queryFn: async () => {
      const { data } = await api.get('/units-of-measure');
      return data as { id: string; name: string; code: string }[];
    },
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data } = await api.get('/warehouses');
      return data as { id: string; name: string }[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        name: form.name,
        supplyTypeId: form.supplyTypeId,
        unitOfMeasureId: form.unitOfMeasureId,
      };
      if (form.sku) payload.sku = form.sku;
      if (form.warehouseId && form.initialQuantity !== '') {
        payload.warehouseId = form.warehouseId;
        payload.initialQuantity = Number(form.initialQuantity);
        if (form.initialNotes) payload.initialNotes = form.initialNotes;
      }
      const { data } = await api.post('/inventory/supplies', payload);
      return data as { id: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setModalOpen(false);
      setForm(emptyForm);
      setFormError(null);
      navigate(`/inventory/${data.id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message ?? 'Error al crear insumo';
      setFormError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    },
  });

  const columns = [
    { key: 'name', header: 'Insumo' },
    { key: 'sku', header: 'SKU', render: (row: SupplyItem) => row.sku ?? '—' },
    {
      key: 'supplyType',
      header: 'Tipo',
      render: (row: SupplyItem) => row.supplyType?.name ?? '—',
    },
    {
      key: 'purchaseUnitPrice',
      header: 'Costo unit.',
      render: (row: SupplyItem) => (
        <span className="font-mono">${formatMoney(row.purchaseUnitPrice)}</span>
      ),
    },
    {
      key: 'stockOnHand',
      header: 'Disponible',
      render: (row: SupplyItem) => (
        <span className="font-mono">{formatQty(row.stockOnHand)}</span>
      ),
    },
    {
      key: 'stockRequested',
      header: 'Solicitado',
      render: (row: SupplyItem) => (
        <span className="font-mono text-amber-600">{formatQty(row.stockRequested)}</span>
      ),
    },
    {
      key: 'stockShortage',
      header: 'Faltante',
      render: (row: SupplyItem) => {
        const v = Number(row.stockShortage);
        return (
          <span className={`font-mono ${v > 0 ? 'text-red-600 font-semibold' : ''}`}>
            {formatQty(row.stockShortage)}
          </span>
        );
      },
    },
    {
      key: 'unitOfMeasure',
      header: 'Unidad',
      render: (row: SupplyItem) => row.unitOfMeasure?.code ?? '—',
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row: SupplyItem) => <ActiveBadge isActive={row.isActive} />,
    },
  ];

  const canCreate =
    form.name && form.supplyTypeId && form.unitOfMeasureId && !createMutation.isPending;

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventario</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Insumos y ajustes de stock por almacén
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo insumo
          </Button>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
              >
                <option value="">Todos</option>
                {supplyTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm pt-6">
              <input
                type="checkbox"
                checked={filterDisponible}
                onChange={(e) => setFilterDisponible(e.target.checked)}
              />
              Disponible
            </label>
            <label className="flex items-center gap-2 text-sm pt-6">
              <input
                type="checkbox"
                checked={filterFaltante}
                onChange={(e) => setFilterFaltante(e.target.checked)}
              />
              Faltante
            </label>
            <Button
              variant="secondary"
              onClick={() => {
                setFilterEstado('active');
                setFilterTipo('');
                setFilterDisponible(false);
                setFilterFaltante(false);
              }}
            >
              Limpiar
            </Button>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <DataTable
            columns={columns}
            data={rows}
            onRowClick={(row) => navigate(`/inventory/${row.id}`)}
          />
        </Card>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setFormError(null);
                }}
                className="absolute top-3 right-3 text-[var(--color-text-secondary)]"
              >
                <X size={18} />
              </button>
              <h2 className="text-lg font-semibold mb-4">Registrar insumo</h2>
              {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}

              <div className="space-y-3">
                <FormField label="Nombre *">
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </FormField>
                <FormField label="Tipo de insumo *">
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.supplyTypeId}
                    onChange={(e) => setForm((f) => ({ ...f, supplyTypeId: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    {supplyTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Unidad de medida *">
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.unitOfMeasureId}
                    onChange={(e) => setForm((f) => ({ ...f, unitOfMeasureId: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} — {u.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="SKU">
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  />
                </FormField>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Stock inicial (opcional): crea un ajuste de inventario
                </p>
                <FormField label="Almacén">
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.warehouseId}
                    onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
                  >
                    <option value="">Sin stock inicial</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Cantidad inicial">
                  <input
                    type="number"
                    step="any"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.initialQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, initialQuantity: e.target.value }))}
                  />
                </FormField>
                <FormField label="Notas del ajuste">
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.initialNotes}
                    onChange={(e) => setForm((f) => ({ ...f, initialNotes: e.target.value }))}
                  />
                </FormField>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setModalOpen(false);
                    setFormError(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={() => createMutation.mutate()} disabled={!canCreate}>
                  Crear insumo
                </Button>
              </div>
            </Card>
          </div>
        )}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
