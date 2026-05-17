import { useQuery } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';
import { CatalogCrudPage } from '../../components/settings/CatalogCrudPage';
import {
  brandsConfig,
  buildSilhouettesConfig,
  buildWarehousesConfig,
  loadSilhouetteCategoryOptions,
  loadWorkSiteOptions,
  pantoneColorsConfig,
  rolesConfig,
  sizesConfig,
  workSitesConfig,
  workOrderTypesConfig,
  type SettingsCatalogId,
} from './catalogConfigs';
import { SupplyCatalogsPage } from './SupplyCatalogsPage';

export function SettingsCatalogRoute() {
  const { catalogId } = useParams<{ catalogId: string }>();

  if (catalogId === 'supply-catalogs') {
    return <SupplyCatalogsPage />;
  }

  if (catalogId === 'work-sites') {
    return <CatalogCrudPage config={workSitesConfig} />;
  }

  if (catalogId === 'roles') {
    return <CatalogCrudPage config={rolesConfig} />;
  }

  if (catalogId === 'brands') {
    return <CatalogCrudPage config={brandsConfig} />;
  }

  if (catalogId === 'sizes') {
    return <CatalogCrudPage config={sizesConfig} />;
  }

  if (catalogId === 'pantone-colors') {
    return <CatalogCrudPage config={pantoneColorsConfig} />;
  }

  if (catalogId === 'warehouses') {
    return <WarehousesCatalogPage />;
  }

  if (catalogId === 'silhouettes') {
    return <SilhouettesCatalogPage />;
  }

  if (catalogId === 'work-order-types') {
    return <CatalogCrudPage config={workOrderTypesConfig} />;
  }

  const valid: SettingsCatalogId[] = [
    'work-sites',
    'warehouses',
    'roles',
    'brands',
    'silhouettes',
    'sizes',
    'pantone-colors',
    'supply-catalogs',
    'work-order-types',
  ];
  if (!catalogId || !valid.includes(catalogId as SettingsCatalogId)) {
    return <Navigate to="/settings" replace />;
  }

  return <Navigate to="/settings" replace />;
}

function WarehousesCatalogPage() {
  const { data: options = [] } = useQuery({
    queryKey: ['work-sites', 'options'],
    queryFn: loadWorkSiteOptions,
  });
  const config = buildWarehousesConfig(options);
  return <CatalogCrudPage config={config} />;
}

function SilhouettesCatalogPage() {
  const { data: options = [] } = useQuery({
    queryKey: ['silhouettes', 'categories', 'options'],
    queryFn: loadSilhouetteCategoryOptions,
  });
  const config = buildSilhouettesConfig(options);
  return <CatalogCrudPage config={config} />;
}
