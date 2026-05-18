const LABELS: Record<string, string> = {
  bajo: 'Bajo',
  normal: 'Normal',
  alto: 'Alto',
  urgente: 'Urgente',
};

const STYLES: Record<string, string> = {
  bajo: 'text-green-700 bg-green-50 border-green-200',
  normal: 'text-[var(--color-text-secondary)]',
  alto: 'text-orange-700 bg-orange-50 border-orange-200',
  urgente: 'text-red-700 bg-red-50 border-red-200',
};

export function UrgencyBadge({ urgency }: { urgency?: string }) {
  const key = urgency ?? 'normal';
  const label = LABELS[key] ?? key;
  const style = STYLES[key] ?? STYLES.normal;

  if (key === 'normal') {
    return <span className="text-sm">{label}</span>;
  }

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
}
