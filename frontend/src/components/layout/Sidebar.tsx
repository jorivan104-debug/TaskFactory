import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  Truck,
  DollarSign,
  BarChart3,
  Settings,
  Palette,
  Boxes,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Órdenes de trabajo', href: '/work-orders', icon: ClipboardList },
  { name: 'Referencias', href: '/garment-references', icon: Palette },
  { name: 'Inventario', href: '/inventory', icon: Package },
  { name: 'Compras', href: '/purchasing', icon: ShoppingCart },
  { name: 'Pedidos internos', href: '/internal-orders', icon: FileText },
  { name: 'Personal', href: '/employees', icon: Users },
  { name: 'Logística', href: '/shipments', icon: Truck },
  { name: 'Finanzas', href: '/accounting', icon: DollarSign },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { name: 'Proveedores', href: '/suppliers', icon: Boxes },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-[var(--color-border)] flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
        <span className="text-xl font-bold text-[var(--color-primary)]">TaskFactory</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1',
                isActive
                  ? 'bg-[var(--color-accent-blue-light)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-blue-pale)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
