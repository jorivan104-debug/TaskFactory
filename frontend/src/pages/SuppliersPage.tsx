import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { ActiveBadge } from '../components/settings/CatalogCrudPage';
import { Plus, Pencil, X, Ban } from 'lucide-react';
import api from '../lib/api';
import {
  SUPPLIER_TYPE_OPTIONS,
  supplierDisplayName,
  supplierTypeLabel,
} from '../lib/supplier-types';

interface SupplierRow {
  id: string;
  legalName: string;
  tradeName?: string | null;
  supplierType: string;
  taxId?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  isActive: boolean;
}

interface FormState {
  legalName: string;
  tradeName: string;
  supplierType: string;
  taxId: string;
  city: string;
  phone: string;
  email: string;
  contactPerson: string;
  notes: string;
}

const emptyForm: FormState = {
  legalName: '',
  tradeName: '',
  supplierType: 'otro',
  taxId: '',
  city: '',
  phone: '',
  email: '',
  contactPerson: '',
  notes: '',
};

export function SuppliersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: rows = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await api.get('/suppliers');
      return data as SupplierRow[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['suppliers'] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        legalName: form.legalName,
        tradeName: form.tradeName || undefined,
        supplierType: form.supplierType,
        taxId: form.taxId || undefined,
        city: form.city || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        contactPerson: form.contactPerson || undefined,
        notes: form.notes || undefined,
      };
      if (editingId) {
        await api.patch(`/suppliers/${editingId}`, payload);
      } else {
        await api.post('/suppliers', payload);
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
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => invalidate(),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: SupplierRow) => {
    setEditingId(row.id);
    setForm({
      legalName: row.legalName,
      tradeName: row.tradeName ?? '',
      supplierType: row.supplierType,
      taxId: row.taxId ?? '',
      city: row.city ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      contactPerson: row.contactPerson ?? '',
      notes: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const columns = [
    {
      key: 'legalName',
      header: 'Nombre',
      render: (row: SupplierRow) => supplierDisplayName(row),
    },
    {
      key: 'supplierType',
      header: 'Tipo de proveedor',
      render: (row: SupplierRow) => supplierTypeLabel(row.supplierType),
    },
    { key: 'taxId', header: 'NIT', render: (row: SupplierRow) => row.taxId ?? '—' },
    { key: 'city', header: 'Ciudad', render: (row: SupplierRow) => row.city ?? '—' },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row: SupplierRow) => <ActiveBadge isActive={row.isActive} />,
    },
    {
      key: '_actions',
      header: 'Acciones',
      render: (row: SupplierRow) => (
        <div className="flex gap-1">
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
          {row.isActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`¿Desactivar ${row.legalName}?`)) {
                  deactivateMutation.mutate(row.id);
                }
              }}
              className="p-1.5 rounded hover:bg-red-50 text-red-600"
              title="Desactivar"
            >
              <Ban size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Nuevo proveedor
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={rows} />
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 text-[var(--color-text-secondary)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar proveedor' : 'Nuevo proveedor'}
            </h2>
            {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Razón social *</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.legalName}
                  onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre comercial</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.tradeName}
                  onChange={(e) => setForm((f) => ({ ...f, tradeName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de proveedor *</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.supplierType}
                  onChange={(e) => setForm((f) => ({ ...f, supplierType: e.target.value }))}
                >
                  {SUPPLIER_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">NIT</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.taxId}
                    onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contacto</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.contactPerson}
                  onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !form.legalName}
              >
                {editingId ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
