import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CatalogCrudPage } from '../../components/settings/CatalogCrudPage';
import { supplyTypesConfig, unitsOfMeasureConfig } from './catalogConfigs';
import clsx from 'clsx';

type Tab = 'units' | 'supply-types';

export function SupplyCatalogsPage() {
  const [tab, setTab] = useState<Tab>('units');

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] mb-2"
        >
          <ArrowLeft size={16} />
          Configuración
        </Link>
        <h1 className="text-2xl font-bold">Unidades y tipos de insumo</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Unidades de medida y categorías de insumos
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setTab('units')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            tab === 'units'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
          )}
        >
          Unidades de medida
        </button>
        <button
          type="button"
          onClick={() => setTab('supply-types')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            tab === 'supply-types'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
          )}
        >
          Tipos de insumo
        </button>
      </div>

      {tab === 'units' ? (
        <CatalogCrudPage
          embedded
          config={{
            ...unitsOfMeasureConfig,
            title: 'Unidades de medida',
          }}
          backHref="/settings"
        />
      ) : (
        <CatalogCrudPage
          embedded
          config={{
            ...supplyTypesConfig,
            title: 'Tipos de insumo',
          }}
          backHref="/settings"
        />
      )}
    </div>
  );
}
