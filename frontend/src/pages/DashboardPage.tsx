import { Card } from '../components/ui/Card';
import { Factory, Package, ShoppingCart, Users, TrendingUp, Clock, DollarSign, Truck } from 'lucide-react';

const stats = [
  { label: 'Órdenes activas', value: '24', icon: Factory, color: 'var(--color-primary)' },
  { label: 'En inventario', value: '1,250', icon: Package, color: 'var(--color-accent-green)' },
  { label: 'Compras pendientes', value: '8', icon: ShoppingCart, color: 'var(--color-accent-orange)' },
  { label: 'Personal activo', value: '38', icon: Users, color: 'var(--color-secondary)' },
];

const kpis = [
  { label: 'Unidades producidas (mes)', value: '4,520', trend: '+12%', icon: TrendingUp },
  { label: 'Tiempo promedio por proceso', value: '2.3 días', trend: '-8%', icon: Clock },
  { label: 'Costo promedio por referencia', value: '$45,200', trend: '-3%', icon: DollarSign },
  { label: 'Envíos en tránsito', value: '5', trend: '', icon: Truck },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold mt-8">KPIs operativos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-center justify-between mb-2">
              <kpi.icon size={18} className="text-[var(--color-text-secondary)]" />
              {kpi.trend && (
                <span className={kpi.trend.startsWith('+') ? 'text-[var(--color-accent-green)] text-xs font-medium' : 'text-[var(--color-primary)] text-xs font-medium'}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <p className="text-xl font-bold">{kpi.value}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">{kpi.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
