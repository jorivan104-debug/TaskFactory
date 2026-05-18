import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { ActiveBadge } from '../components/settings/CatalogCrudPage';
import { Plus, Pencil, X, Ban, Package, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { ImageField } from '../components/garment-references/ImageField';
import { formatMoney, lineCost } from '../lib/money';

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
  imageUrl?: string | null;
  garmentImageUrl1?: string | null;
  garmentImageUrl2?: string | null;
  garmentImageUrl3?: string | null;
  brand?: { id: string; name: string; consecutivo: number };
  silhouette?: { id: string; name: string };
  referenceCost?: string | number;
}

function thumbSrc(row: GarmentRefRow) {
  return row.imageUrl ?? row.garmentImageUrl1 ?? null;
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
  silhouetteId: string;
  title: string;
  garmentImageUrl1: string;
  garmentImageUrl2: string;
  garmentImageUrl3: string;
}

const emptyForm: FormState = {
  brandId: '',
  referenceType: '',
  silhouetteId: '',
  title: '',
  garmentImageUrl1: '',
  garmentImageUrl2: '',
  garmentImageUrl3: '',
};

interface SupplyOption {
  id: string;
  name: string;
  sku?: string;
  supplyType?: { name: string };
  unitOfMeasure?: { code: string; name: string };
}

interface BomRow {
  id: string;
  supplyId: string;
  quantityPerGarment: string | number;
  unitCost: string | number;
  sortOrder?: number;
  supply: { id: string; name: string; sku?: string; supplyType?: { name: string }; unitOfMeasure?: { code: string; name: string } };
}

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

  const { data: silhouettes = [] } = useQuery({
    queryKey: ['silhouettes'],
    queryFn: async () => {
      const { data } = await api.get('/silhouettes');
      return data as { id: string; name: string }[];
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

  const imagePayload = () => ({
    garmentImageUrl1: form.garmentImageUrl1 || undefined,
    garmentImageUrl2: form.garmentImageUrl2 || undefined,
    garmentImageUrl3: form.garmentImageUrl3 || undefined,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        await api.patch(`/garment-references/${editingId}`, {
          title: form.title || undefined,
          silhouetteId: form.silhouetteId || undefined,
          ...imagePayload(),
        });
      } else {
        await api.post('/garment-references', {
          brandId: form.brandId,
          referenceType: form.referenceType,
          title: form.title || undefined,
          silhouetteId: form.silhouetteId || undefined,
          ...imagePayload(),
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
      silhouetteId: row.silhouette?.id ?? '',
      title: row.title ?? '',
      garmentImageUrl1: row.garmentImageUrl1 ?? row.imageUrl ?? '',
      garmentImageUrl2: row.garmentImageUrl2 ?? '',
      garmentImageUrl3: row.garmentImageUrl3 ?? '',
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

  // ── BOM Panel ──
  const [bomRefId, setBomRefId] = useState<string | null>(null);
  const [bomRefCode, setBomRefCode] = useState<string>('');
  const [bomAddOpen, setBomAddOpen] = useState(false);
  const [bomForm, setBomForm] = useState({ supplyId: '', quantityPerGarment: '', unitCost: '' });

  const { data: bomRows = [], refetch: refetchBom } = useQuery({
    queryKey: ['bom', bomRefId],
    queryFn: async () => {
      if (!bomRefId) return [];
      const { data } = await api.get(`/garment-references/${bomRefId}/supply-requirements`);
      return data as BomRow[];
    },
    enabled: !!bomRefId,
  });

  const { data: allSupplies = [] } = useQuery({
    queryKey: ['all-supplies'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/items', { params: { isActive: true } });
      return data as SupplyOption[];
    },
  });

  const bomUpsertMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/garment-references/${bomRefId}/supply-requirements`, {
        supplyId: bomForm.supplyId,
        quantityPerGarment: parseFloat(bomForm.quantityPerGarment),
        unitCost: parseFloat(bomForm.unitCost) || 0,
      });
    },
    onSuccess: () => {
      refetchBom();
      invalidate();
      setBomAddOpen(false);
      setBomForm({ supplyId: '', quantityPerGarment: '', unitCost: '' });
    },
  });

  const bomDeleteMutation = useMutation({
    mutationFn: (supplyId: string) =>
      api.delete(`/garment-references/${bomRefId}/supply-requirements/${supplyId}`),
    onSuccess: () => {
      refetchBom();
      invalidate();
    },
  });

  const bomRefRow = rows.find((r) => r.id === bomRefId);
  const bomLinesTotal = bomRows.reduce(
    (sum, row) => sum + lineCost(row.quantityPerGarment, row.unitCost ?? 0),
    0,
  );
  const referenceCostDisplay = bomRefRow?.referenceCost ?? bomLinesTotal;

  const openBom = (row: GarmentRefRow) => {
    setBomRefId(row.id);
    setBomRefCode(row.code);
  };

  const [detailRef, setDetailRef] = useState<GarmentRefRow | null>(null);

  const { data: detailBom = [] } = useQuery({
    queryKey: ['bom', detailRef?.id, 'detail'],
    queryFn: async () => {
      if (!detailRef) return [];
      const { data } = await api.get(`/garment-references/${detailRef.id}/supply-requirements`);
      return data as BomRow[];
    },
    enabled: !!detailRef,
  });

  const handleDeactivate = (row: GarmentRefRow) => {
    if (!window.confirm(`¿Desactivar la referencia ${row.code}?`)) return;
    deactivateMutation.mutate(row.id);
  };

  const tableColumns = [
    {
      key: 'thumb',
      header: '',
      render: (row: GarmentRefRow) => {
        const src = thumbSrc(row);
        return src ? (
          <img src={src} alt="" className="w-10 h-10 object-cover rounded border" />
        ) : (
          <span className="w-10 h-10 inline-flex items-center justify-center rounded border border-dashed text-xs text-gray-300">
            —
          </span>
        );
      },
    },
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
              openBom(row);
            }}
            className="p-1.5 rounded hover:bg-[var(--color-accent-blue-pale)] text-[var(--color-primary)]"
            title="Insumos (BOM)"
          >
            <Package size={16} />
          </button>
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
        <DataTable
          columns={tableColumns}
          data={rows}
          onRowClick={(row) => setDetailRef(row)}
        />
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
                <label className="block text-sm font-medium mb-1">Silueta</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.silhouetteId}
                  onChange={(e) => setForm((f) => ({ ...f, silhouetteId: e.target.value }))}
                >
                  <option value="">Sin silueta</option>
                  {silhouettes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <ImageField
                  label="Frontal"
                  value={form.garmentImageUrl1}
                  onChange={(v) => setForm((f) => ({ ...f, garmentImageUrl1: v }))}
                />
                <ImageField
                  label="Trasera"
                  value={form.garmentImageUrl2}
                  onChange={(v) => setForm((f) => ({ ...f, garmentImageUrl2: v }))}
                />
                <ImageField
                  label="Lateral"
                  value={form.garmentImageUrl3}
                  onChange={(v) => setForm((f) => ({ ...f, garmentImageUrl3: v }))}
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

      {detailRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setDetailRef(null)}
              className="absolute top-3 right-3 text-[var(--color-text-secondary)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-1">{detailRef.title ?? detailRef.code}</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 font-mono">{detailRef.code}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Frontal', src: detailRef.garmentImageUrl1 ?? detailRef.imageUrl },
                { label: 'Trasera', src: detailRef.garmentImageUrl2 },
                { label: 'Lateral', src: detailRef.garmentImageUrl3 },
              ].map((photo) => (
                <div key={photo.label} className="text-center">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">{photo.label}</p>
                  {photo.src ? (
                    <img src={photo.src} alt={photo.label} className="max-h-48 mx-auto rounded border object-contain" />
                  ) : (
                    <p className="text-sm text-gray-300 py-12 border border-dashed rounded">Sin imagen</p>
                  )}
                </div>
              ))}
            </div>
            <h3 className="font-semibold mb-2">Insumos</h3>
            {detailBom.length > 0 ? (
              <>
                <table className="w-full text-sm mb-2">
                  <thead>
                    <tr className="border-b text-left text-[var(--color-text-secondary)]">
                      <th className="py-2">Insumo</th>
                      <th className="py-2 text-right">Cant/prenda</th>
                      <th className="py-2 text-right">Valor unit.</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailBom.map((row) => (
                      <tr key={row.id} className="border-b">
                        <td className="py-2">{row.supply.name}</td>
                        <td className="py-2 text-right font-mono">{Number(row.quantityPerGarment)}</td>
                        <td className="py-2 text-right font-mono">${formatMoney(row.unitCost)}</td>
                        <td className="py-2 text-right font-mono">
                          ${formatMoney(lineCost(row.quantityPerGarment, row.unitCost))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-sm font-semibold mb-4 text-right">
                  Costo de la referencia:{' '}
                  <span className="font-mono text-[var(--color-primary)]">
                    ${formatMoney(detailRef.referenceCost ?? detailBom.reduce(
                      (s, r) => s + lineCost(r.quantityPerGarment, r.unitCost),
                      0,
                    ))}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">Sin insumos registrados.</p>
            )}
            <Button size="sm" variant="secondary" onClick={() => { openBom(detailRef); setDetailRef(null); }}>
              <Package size={14} className="mr-1 inline" />
              Gestionar insumos
            </Button>
          </Card>
        </div>
      )}

      {/* BOM Panel */}
      {bomRefId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setBomRefId(null)}
              className="absolute top-3 right-3 text-[var(--color-text-secondary)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-1">Insumos requeridos (BOM)</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Referencia: <strong className="font-mono">{bomRefCode}</strong>
            </p>

            {bomRows.length > 0 ? (
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="border-b text-left text-[var(--color-text-secondary)]">
                    <th className="py-2 pr-2">Insumo</th>
                    <th className="py-2 pr-2">Tipo</th>
                    <th className="py-2 pr-2 text-right">Cant/prenda</th>
                    <th className="py-2 pr-2 text-right">Valor insumo</th>
                    <th className="py-2 pr-2 text-right">Subtotal</th>
                    <th className="py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {bomRows.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2 pr-2">{row.supply.name}</td>
                      <td className="py-2 pr-2">{row.supply.supplyType?.name ?? '—'}</td>
                      <td className="py-2 pr-2 text-right font-mono">{Number(row.quantityPerGarment)}</td>
                      <td className="py-2 pr-2 text-right font-mono">${formatMoney(row.unitCost)}</td>
                      <td className="py-2 pr-2 text-right font-mono">
                        ${formatMoney(lineCost(row.quantityPerGarment, row.unitCost))}
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => bomDeleteMutation.mutate(row.supplyId)}
                          className="p-1 rounded hover:bg-red-50 text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Sin insumos asignados.
              </p>
            )}

            <p className="text-sm font-semibold mb-4 text-right border-t pt-3">
              Costo de la referencia:{' '}
              <span className="font-mono text-[var(--color-primary)]">
                ${formatMoney(referenceCostDisplay)}
              </span>
            </p>

            {bomAddOpen ? (
              <div className="space-y-3 border rounded p-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Insumo *</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={bomForm.supplyId}
                    onChange={(e) => setBomForm((f) => ({ ...f, supplyId: e.target.value }))}
                  >
                    <option value="">Seleccionar insumo</option>
                    {allSupplies
                      .filter((s) => !bomRows.some((r) => r.supplyId === s.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.supplyType?.name})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cantidad por prenda *</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={bomForm.quantityPerGarment}
                      onChange={(e) =>
                        setBomForm((f) => ({ ...f, quantityPerGarment: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valor del insumo</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={bomForm.unitCost}
                      onChange={(e) => setBomForm((f) => ({ ...f, unitCost: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => bomUpsertMutation.mutate()}
                    disabled={!bomForm.supplyId || !bomForm.quantityPerGarment}
                  >
                    Agregar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setBomAddOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" onClick={() => setBomAddOpen(true)}>
                <Plus size={14} className="mr-1" />
                Agregar insumo
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
