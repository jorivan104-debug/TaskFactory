import { Card } from '../components/ui/Card';
import { TrendingUp, Clock, DollarSign, Gauge, Truck } from 'lucide-react';

const kpiCards = [
  {
    title: 'Unidades producidas',
    value: '4,520',
    description: 'Total del mes actual',
    icon: TrendingUp,
    color: 'var(--color-primary)',
  },
  {
    title: 'Tiempos promedio',
    value: '2.3 días',
    description: 'Tiempo promedio por proceso',
    icon: Clock,
    color: 'var(--color-secondary)',
  },
  {
    title: 'Costos por referencia',
    value: '$45,200',
    description: 'Costo promedio unitario',
    icon: DollarSign,
    color: 'var(--color-accent-orange)',
  },
  {
    title: 'Eficiencia',
    value: '87%',
    description: 'Promedio general de planta',
    icon: Gauge,
    color: 'var(--color-accent-green)',
  },
  {
    title: 'Envíos',
    value: '12',
    description: 'Entregas completadas este mes',
    icon: Truck,
    color: 'var(--color-accent-red)',
  },
];

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reportes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${kpi.color}15` }}
              >
                <kpi.icon size={24} style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{kpi.title}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{kpi.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
