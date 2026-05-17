import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DataTable } from '../ui/DataTable';

export type CatalogFieldType = 'text' | 'number' | 'select';

export interface CatalogField {
  name: string;
  label: string;
  type: CatalogFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface CatalogColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

export interface CatalogCrudConfig {
  title: string;
  description?: string;
  apiPath: string;
  entityLabel: string;
  columns: CatalogColumn[];
  fields: CatalogField[];
  getRowId?: (row: Record<string, unknown>) => string;
  mapRowToForm?: (row: Record<string, unknown>) => Record<string, string | number>;
  preparePayload?: (form: Record<string, string | number>) => Record<string, unknown>;
}

interface CatalogCrudPageProps {
  config: CatalogCrudConfig;
  backHref?: string;
  /** Oculta título y enlace atrás (p. ej. pestañas dentro de otra página). */
  embedded?: boolean;
}

function emptyForm(fields: CatalogField[]): Record<string, string | number> {
  const form: Record<string, string | number> = {};
  for (const f of fields) {
    form[f.name] = '';
  }
  return form;
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={
        isActive
          ? 'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700'
          : 'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
      }
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export function CatalogCrudPage({
  config,
  backHref = '/settings',
  embedded = false,
}: CatalogCrudPageProps) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => emptyForm(config.fields));
  const [formError, setFormError] = useState<string | null>(null);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ['catalog', config.apiPath],
    queryFn: async () => {
      const { data } = await api.get(config.apiPath);
      return data as Record<string, unknown>[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['catalog', config.apiPath] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = config.preparePayload
        ? config.preparePayload(form)
        : { ...form };
      for (const field of config.fields) {
        if (field.type === 'number' && payload[field.name] === '') {
          delete payload[field.name];
        } else if (field.type === 'number' && payload[field.name] !== undefined) {
          payload[field.name] = Number(payload[field.name]);
        }
        if (field.type === 'select' && payload[field.name] === '') {
          delete payload[field.name];
        }
      }
      if (editingId) {
        await api.patch(`${config.apiPath}/${editingId}`, payload);
      } else {
        await api.post(config.apiPath, payload);
      }
    },
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message ?? 'No se pudo guardar';
      setFormError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`${config.apiPath}/${id}`),
    onSuccess: () => invalidate(),
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo eliminar';
      alert(msg);
    },
  });

  const getId = (row: Record<string, unknown>) =>
    config.getRowId?.(row) ?? String(row.id ?? '');

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(config.fields));
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(getId(row));
    const mapped = config.mapRowToForm?.(row);
    if (mapped) {
      setForm(mapped);
    } else {
      const next: Record<string, string | number> = {};
      for (const field of config.fields) {
        const v = row[field.name];
        next[field.name] = v === null || v === undefined ? '' : (v as string | number);
      }
      setForm(next);
    }
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleDelete = (row: Record<string, unknown>) => {
    const label = String(row.name ?? row.code ?? row.key ?? config.entityLabel);
    if (!window.confirm(`¿Eliminar o desactivar «${label}»?`)) return;
    deleteMutation.mutate(getId(row));
  };

  const tableColumns = [
    ...config.columns,
    {
      key: '_actions',
      header: 'Acciones',
      render: (row: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="p-2 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-accent-blue-pale)]"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="p-2 rounded-lg text-[var(--color-accent-red)] hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {!embedded ? (
        <div>
          <Link
            to={backHref}
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] mb-2"
          >
            <ArrowLeft size={16} />
            Configuración
          </Link>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          {config.description && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{config.description}</p>
          )}
        </div>
        ) : (
        <div />
        )}
        <Button onClick={openCreate} className={embedded ? 'sm:ml-auto' : undefined}>
          <Plus size={16} className="mr-2" />
          Nuevo {config.entityLabel}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 text-sm">
          No se pudo cargar la lista. Verifique su sesión y la conexión con el servidor.
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-[var(--color-text-secondary)] text-sm">Cargando…</p>
        ) : (
          <DataTable columns={tableColumns} data={rows} onRowClick={openEdit} />
        )}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? `Editar ${config.entityLabel}` : `Nuevo ${config.entityLabel}`}
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
            >
              {config.fields.map((field) => (
                <label key={field.name} className="block text-sm">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </span>
                  {field.type === 'select' ? (
                    <select
                      className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
                      value={String(form[field.name] ?? '')}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field.name]: e.target.value }))
                      }
                      required={field.required}
                    >
                      <option value="">— Seleccionar —</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      className="mt-1 w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
                      placeholder={field.placeholder}
                      value={form[field.name] ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          [field.name]: e.target.value,
                        }))
                      }
                      required={field.required}
                    />
                  )}
                </label>
              ))}
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
