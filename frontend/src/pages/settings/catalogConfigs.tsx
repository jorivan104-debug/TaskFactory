import { Link } from 'react-router-dom';
import { Workflow } from 'lucide-react';
import type { CatalogCrudConfig } from '../../components/settings/CatalogCrudPage';
import { ActiveBadge } from '../../components/settings/CatalogCrudPage';
import api from '../../lib/api';
import { normalizeHexColor } from '../../lib/color';

const activeColumn = {
  key: 'isActive',
  header: 'Estado',
  render: (row: Record<string, unknown>) => (
    <ActiveBadge isActive={Boolean(row.isActive)} />
  ),
};

export const workSitesConfig: CatalogCrudConfig = {
  title: 'Plantas',
  description: 'Gestionar plantas de producción',
  apiPath: '/work-sites',
  entityLabel: 'planta',
  columns: [
    { key: 'code', header: 'Código' },
    { key: 'name', header: 'Nombre' },
    activeColumn,
  ],
  fields: [
    { name: 'code', label: 'Código', type: 'text', required: true, placeholder: 'PLT-01' },
    { name: 'name', label: 'Nombre', type: 'text', required: true },
  ],
};

export async function loadWorkSiteOptions() {
  const { data } = await api.get('/work-sites');
  return (data as { id: string; code: string; name: string; isActive?: boolean }[])
    .filter((s) => s.isActive !== false)
    .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }));
}

export function buildWarehousesConfig(workSiteOptions: { value: string; label: string }[]): CatalogCrudConfig {
  return {
    title: 'Almacenes',
    description: 'Configurar almacenes e inventarios',
    apiPath: '/warehouses',
    entityLabel: 'almacén',
    columns: [
      { key: 'code', header: 'Código' },
      { key: 'name', header: 'Nombre' },
      {
        key: 'workSite',
        header: 'Planta',
        render: (row) => {
          const ws = row.workSite as { name?: string } | null;
          return ws?.name ?? '—';
        },
      },
      activeColumn,
    ],
    fields: [
      { name: 'code', label: 'Código', type: 'text', required: true },
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      {
        name: 'workSiteId',
        label: 'Planta',
        type: 'select',
        options: workSiteOptions,
      },
    ],
    mapRowToForm: (row) => ({
      code: String(row.code ?? ''),
      name: String(row.name ?? ''),
      workSiteId: String((row.workSiteId as string) ?? ''),
    }),
  };
}

export const rolesConfig: CatalogCrudConfig = {
  title: 'Roles',
  description: 'Roles y permisos de usuario',
  apiPath: '/roles',
  entityLabel: 'rol',
  columns: [
    { key: 'key', header: 'Clave' },
    { key: 'name', header: 'Nombre' },
    {
      key: '_count',
      header: 'Usuarios',
      render: (row) => {
        const c = row._count as { userRoles?: number } | undefined;
        return String(c?.userRoles ?? 0);
      },
    },
  ],
  fields: [
    { name: 'key', label: 'Clave', type: 'text', required: true, placeholder: 'ADMIN' },
    { name: 'name', label: 'Nombre', type: 'text', required: true },
  ],
};

export const brandsConfig: CatalogCrudConfig = {
  title: 'Marcas',
  description: 'Marcas de productos',
  apiPath: '/brands',
  entityLabel: 'marca',
  columns: [
    { key: 'name', header: 'Nombre' },
    { key: 'abbreviation', header: 'Abreviatura' },
    { key: 'consecutivo', header: 'Consecutivo' },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'abbreviation', label: 'Abreviatura', type: 'text', required: true },
    {
      name: 'consecutivo',
      label: 'Consecutivo (100-999)',
      type: 'number',
      required: true,
      placeholder: '150',
    },
  ],
  fetchCreateDefaults: async () => {
    const { data } = await api.get<{ consecutivo: number }>('/brands/suggested-create-defaults');
    return { consecutivo: data.consecutivo };
  },
  mapRowToForm: (row) => ({
    name: String(row.name ?? ''),
    abbreviation: String(row.abbreviation ?? ''),
    consecutivo: Number(row.consecutivo ?? 100),
  }),
};

export async function loadSilhouetteCategoryOptions() {
  const { data } = await api.get('/silhouettes/categories');
  return (data as { id: string; name: string; isActive?: boolean }[])
    .filter((c) => c.isActive !== false)
    .map((c) => ({ value: c.id, label: c.name }));
}

export function buildSilhouettesConfig(
  categoryOptions: { value: string; label: string }[],
): CatalogCrudConfig {
  return {
    title: 'Siluetas',
    description: 'Tipos de silueta para confección',
    apiPath: '/silhouettes',
    entityLabel: 'silueta',
    columns: [
      {
        key: 'imageUrl',
        header: 'Miniatura',
        render: (row) => {
          const src = row.imageUrl as string | undefined;
          if (!src) return '—';
          return (
            <img
              src={src}
              alt=""
              className="h-10 w-10 rounded border border-[var(--color-border)] object-cover"
            />
          );
        },
      },
      { key: 'name', header: 'Nombre' },
      { key: 'gender', header: 'Género', render: (row) => String(row.gender ?? '—') },
      {
        key: 'silhouetteCategory',
        header: 'Categoría',
        render: (row) => {
          const cat = row.silhouetteCategory as { name?: string } | null;
          return cat?.name ?? '—';
        },
      },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      {
        name: 'silhouetteCategoryId',
        label: 'Categoría',
        type: 'select',
        required: true,
        options: categoryOptions,
      },
      {
        name: 'gender',
        label: 'Género',
        type: 'select',
        options: [
          { value: 'Dama', label: 'Dama' },
          { value: 'Caballero', label: 'Caballero' },
          { value: 'Niño', label: 'Niño' },
          { value: 'Niña', label: 'Niña' },
          { value: 'Unisex', label: 'Unisex' },
        ],
      },
      { name: 'imageUrl', label: 'Foto miniatura', type: 'image' },
    ],
    mapRowToForm: (row) => ({
      name: String(row.name ?? ''),
      silhouetteCategoryId: String((row.silhouetteCategoryId as string) ?? ''),
      gender: String(row.gender ?? ''),
      imageUrl: String(row.imageUrl ?? ''),
    }),
  };
}

export const sizesConfig: CatalogCrudConfig = {
  title: 'Tallas',
  description: 'Curvas y tallas disponibles',
  apiPath: '/sizes',
  entityLabel: 'talla',
  columns: [
    { key: 'name', header: 'Nombre' },
    { key: 'sortOrder', header: 'Orden' },
    activeColumn,
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'M, L, XL…' },
    { name: 'sortOrder', label: 'Orden', type: 'number' },
  ],
};

export const pantoneColorsConfig: CatalogCrudConfig = {
  title: 'Colores',
  description: 'Paleta de colores de productos',
  apiPath: '/pantone-colors',
  entityLabel: 'color',
  columns: [
    { key: 'pantoneSystem', header: 'Sistema' },
    { key: 'pantoneCode', header: 'Código' },
    { key: 'name', header: 'Nombre' },
    {
      key: 'hexApprox',
      header: 'Muestra',
      render: (row) => {
        const hex = normalizeHexColor(row.hexApprox as string | undefined);
        if (!hex) return '—';
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className="w-6 h-6 rounded border border-[var(--color-border)]"
              style={{ backgroundColor: hex }}
            />
            {hex}
          </span>
        );
      },
    },
    activeColumn,
  ],
  fields: [
    { name: 'pantoneSystem', label: 'Sistema Pantone', type: 'text', required: true, placeholder: 'TCX' },
    { name: 'pantoneCode', label: 'Código', type: 'text', required: true },
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'hexApprox', label: 'Hex aproximado', type: 'text', placeholder: '#0F4C81 o 758A9F' },
  ],
  preparePayload: (form) => {
    const hex = normalizeHexColor(String(form.hexApprox ?? ''));
    return {
      ...form,
      ...(hex ? { hexApprox: hex } : {}),
    };
  },
};

export const unitsOfMeasureConfig: CatalogCrudConfig = {
  title: 'Unidades de medida',
  apiPath: '/units-of-measure',
  entityLabel: 'unidad',
  columns: [
    { key: 'code', header: 'Código' },
    { key: 'name', header: 'Nombre' },
  ],
  fields: [
    { name: 'code', label: 'Código', type: 'text', required: true, placeholder: 'm, kg, und' },
    { name: 'name', label: 'Nombre', type: 'text', required: true },
  ],
};

export const supplyTypesConfig: CatalogCrudConfig = {
  title: 'Tipos de insumo',
  apiPath: '/supply-types',
  entityLabel: 'tipo de insumo',
  columns: [
    { key: 'code', header: 'Código' },
    { key: 'name', header: 'Nombre' },
    { key: 'sortOrder', header: 'Orden' },
  ],
  fields: [
    { name: 'code', label: 'Código', type: 'text', required: true, placeholder: 'TELA' },
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'sortOrder', label: 'Orden', type: 'number' },
  ],
};

export const workOrderTypesConfig: CatalogCrudConfig = {
  title: 'Tipos de orden de trabajo',
  description: 'Cada tipo define un blueprint de flujo',
  apiPath: '/work-order-types',
  entityLabel: 'tipo de OT',
  columns: [
    { key: 'code', header: 'Código' },
    { key: 'name', header: 'Nombre' },
    {
      key: 'blueprint',
      header: 'Blueprint',
      render: (row) => {
        const typeId = String(row.id ?? '');
        const bp = row.blueprint as { status?: string; version?: number } | null;
        const badgeClass = !bp
          ? 'bg-[var(--color-accent-blue-pale)] text-[var(--color-primary)]'
          : bp.status === 'published'
            ? 'bg-green-50 text-green-700'
            : 'bg-yellow-50 text-yellow-700';
        const label = !bp
          ? 'Diseñar flujo'
          : bp.status === 'published'
            ? `v${bp.version} · Editar`
            : 'Borrador · Editar';
        return (
          <Link
            to={`/settings/work-order-types/${typeId}/blueprint`}
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity ${badgeClass}`}
            title="Abrir editor de blueprint"
          >
            <Workflow size={14} className="shrink-0" />
            {label}
          </Link>
        );
      },
    },
    activeColumn,
  ],
  fields: [
    { name: 'code', label: 'Código', type: 'text', required: true, placeholder: 'CORTE' },
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'text' },
  ],
};

export type SettingsCatalogId =
  | 'work-sites'
  | 'warehouses'
  | 'roles'
  | 'brands'
  | 'silhouettes'
  | 'sizes'
  | 'pantone-colors'
  | 'supply-catalogs'
  | 'work-order-types';

export const settingsSectionLinks: {
  id: SettingsCatalogId;
  path: string;
  title: string;
  description: string;
}[] = [
  { id: 'work-sites', path: '/settings/work-sites', title: 'Plantas', description: 'Gestionar plantas de producción' },
  { id: 'warehouses', path: '/settings/warehouses', title: 'Almacenes', description: 'Configurar almacenes e inventarios' },
  { id: 'roles', path: '/settings/roles', title: 'Roles', description: 'Roles y permisos de usuario' },
  { id: 'brands', path: '/settings/brands', title: 'Marcas', description: 'Marcas de productos' },
  { id: 'silhouettes', path: '/settings/silhouettes', title: 'Siluetas', description: 'Tipos de silueta para confección' },
  { id: 'sizes', path: '/settings/sizes', title: 'Tallas', description: 'Curvas y tallas disponibles' },
  { id: 'pantone-colors', path: '/settings/pantone-colors', title: 'Colores', description: 'Paleta de colores de productos' },
  {
    id: 'supply-catalogs',
    path: '/settings/supply-catalogs',
    title: 'Unidades y tipos de insumo',
    description: 'Unidades de medida y categorías de insumos',
  },
  {
    id: 'work-order-types',
    path: '/settings/work-order-types',
    title: 'Tipos de OT',
    description: 'Tipos de orden de trabajo y blueprints de flujo',
  },
];
