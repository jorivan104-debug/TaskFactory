import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import {
  Factory,
  Warehouse,
  ShieldCheck,
  Tag,
  Shirt,
  Ruler,
  Palette,
  Box,
  Workflow,
} from 'lucide-react';
import { settingsSectionLinks } from './settings/catalogConfigs';

const icons: Record<string, typeof Factory> = {
  'work-sites': Factory,
  warehouses: Warehouse,
  roles: ShieldCheck,
  brands: Tag,
  silhouettes: Shirt,
  sizes: Ruler,
  'pantone-colors': Palette,
  'supply-catalogs': Box,
  'work-order-types': Workflow,
};

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {settingsSectionLinks.map((section) => {
          const Icon = icons[section.id] ?? Box;
          return (
            <Link key={section.id} to={section.path}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-blue-light)] flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
