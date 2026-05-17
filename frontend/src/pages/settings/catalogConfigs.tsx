import type { CatalogCrudConfig } from '../../components/settings/CatalogCrudPage';
import { ActiveBadge } from '../../components/settings/CatalogCrudPage';
import api from '../../lib/api';

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
    {
      key: 'nextReferenceSequence',
      header: 'Sig. referencia',
      render: (row) => String(row.nextReferenceSequence ?? '1'),
    },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'abbreviation', label: 'Abreviatura', type: 'text', required: true },
    { name: 'nextReferenceSequence', label: 'Siguiente secuencia', type: 'number' },
  ],
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
      { key: 'name', header: 'Nombre' },
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
    ],
    mapRowToForm: (row) => ({
      name: String(row.name ?? ''),
      silhouetteCategoryId: String((row.silhouetteCategoryId as string) ?? ''),
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
        const hex = row.hexApprox as string | undefined;
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
    { name: 'hexApprox', label: 'Hex aproximado', type: 'text', placeholder: '#0F4C81' },
  ],
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

export type SettingsCatalogId =
  | 'work-sites'
  | 'warehouses'
  | 'roles'
  | 'brands'
  | 'silhouettes'
  | 'sizes'
  | 'pantone-colors'
  | 'supply-catalogs';

export const settingsSectionLinks: {
  id: SettingsCatalogId | 'supply-catalogs';
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
];
