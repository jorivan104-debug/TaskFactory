import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { ActiveBadge } from '../components/settings/CatalogCrudPage';
import { Plus, Pencil, X, Ban } from 'lucide-react';
import api from '../lib/api';

interface Brand {
  id: string;
  name: string;
  consecutivo: number;
}

interface GarmentRefRow {
  id: string;
  code: string;
  referenceType: string;
  serie: string;
  title?: string;
  isActive: boolean;
  brand?: { id: string; name: string; consecutivo: number };
}

const REFERENCE_TYPE_OPTIONS = [
  { value: 'muestra', label: 'Muestra' },
  { value: 'produccion', label: 'Producción' },
];

const referenceTypeLabel = (t: string) =>
  REFERENCE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;

interface FormState {
  brandId: string;
  referenceType: string;
  title: string;
}

const emptyForm: FormState = { brandId: '', referenceType: '', title: '' };

export function GarmentReferencesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [preview, setPreview] = useState<{ code: string; serie: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: rows = [] } = useQuery({
    queryKey: ['garment-references'],
    queryFn: async () => {
      const { data } = await api.get('/garment-references');
      return data as GarmentRefRow[];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data as Brand[];
    },
  });

  useEffect(() => {
    if (!modalOpen || editingId || !form.brandId || !form.referenceType) {
      if (!editingId) setPreview(null);
      return;
    }
    const load = async () => {
      try {
        const { data } = await api.get<{ code: string; serie: string }>(
          '/garment-references/preview',
          { params: { brandId: form.brandId, referenceType: form.referenceType } },
        );
        setPreview(data);
      } catch {
        setPreview(null);
      }
    };
    load();
  }, [modalOpen, editingId, form.brandId, form.referenceType]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['garment-references'] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        await api.patch(`/garment-references/${editingId}`, {
          title: form.title || undefined,
        });
      } else {
        await api.post('/garment-references', {
          brandId: form.brandId,
          referenceType: form.referenceType,
          title: form.title || undefined,
        });
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
    mutationFn: (id: string) => api.post(`/garment-references/${id}/deactivate`),
    onSuccess: () => invalidate(),
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo desactivar';
      alert(msg);
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: GarmentRefRow) => {
    setEditingId(row.id);
    setForm({
      brandId: row.brand?.id ?? '',
      referenceType: row.referenceType,
      title: row.title ?? '',
    });
    setPreview({ code: row.code, serie: row.serie });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
    setPreview(null);
  };

  const handleDeactivate = (row: GarmentRefRow) => {
    if (!window.confirm(`¿Desactivar la referencia ${row.code}?`)) return;
    deactivateMutation.mutate(row.id);
  };

  const tableColumns = [
    { key: 'code', header: 'ID' },
    {
      key: 'referenceType',
      header: 'Tipo',
      render: (row: GarmentRefRow) => referenceTypeLabel(row.referenceType),
    },
    {
      key: 'brand',
      header: 'Marca',
      render: (row: GarmentRefRow) => row.brand?.name ?? '—',
    },
    { key: 'serie', header: 'Serie' },
    { key: 'title', header: 'Título', render: (row: GarmentRefRow) => row.title ?? '—' },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row: GarmentRefRow) => <ActiveBadge isActive={row.isActive} />,
    },
    {
      key: '_actions',
      header: 'Acciones',
      render: (row: GarmentRefRow) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="p-1.5 rounded hover:bg-[var(--color-accent-blue-pale)] text-[var(--color-primary)]"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          {row.isActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(row);
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
        <h1 className="text-2xl font-bold">Referencias</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Nueva referencia
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable columns={tableColumns} data={rows} />
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg p-6 relative">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 text-[var(--color-text-secondary)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar referencia' : 'Nueva referencia'}
            </h2>
            {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}

            <div className="space-y-3">
              {!editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Marca *</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.brandId}
                      onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                    >
                      <option value="">Seleccionar marca</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.consecutivo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de referencia *</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.referenceType}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, referenceType: e.target.value }))
                      }
                    >
                      <option value="">Seleccionar tipo</option>
                      {REFERENCE_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {preview && (
                    <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-accent-blue-pale)] rounded px-3 py-2">
                      ID asignado: <strong className="font-mono">{preview.code}</strong>
                      {' · '}
                      Serie: <strong>{preview.serie}</strong>
                    </p>
                  )}
                </>
              )}
              {editingId && preview && (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  ID: <strong className="font-mono">{preview.code}</strong> · Serie:{' '}
                  <strong>{preview.serie}</strong>
                </p>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={
                  saveMutation.isPending ||
                  (!editingId && (!form.brandId || !form.referenceType))
                }
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
