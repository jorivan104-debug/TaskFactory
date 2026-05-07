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
} from 'lucide-react';

const settingSections = [
  { title: 'Plantas', description: 'Gestionar plantas de producción', icon: Factory },
  { title: 'Almacenes', description: 'Configurar almacenes e inventarios', icon: Warehouse },
  { title: 'Roles', description: 'Roles y permisos de usuario', icon: ShieldCheck },
  { title: 'Marcas', description: 'Marcas de productos', icon: Tag },
  { title: 'Siluetas', description: 'Tipos de silueta para confección', icon: Shirt },
  { title: 'Tallas', description: 'Curvas y tallas disponibles', icon: Ruler },
  { title: 'Colores', description: 'Paleta de colores de productos', icon: Palette },
  { title: 'Unidades y tipos de insumo', description: 'Unidades de medida y categorías de insumos', icon: Box },
];

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {settingSections.map((section) => (
          <Card
            key={section.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-blue-light)] flex items-center justify-center shrink-0">
                <section.icon size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{section.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {section.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
