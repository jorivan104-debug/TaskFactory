export const SUPPLIER_TYPE_OPTIONS = [
  { value: 'patronista', label: 'Patronista' },
  { value: 'taller_corte', label: 'Taller de corte' },
  { value: 'taller_confeccion', label: 'Taller de confección' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'otro', label: 'Otro' },
];

export function supplierTypeLabel(value?: string) {
  return SUPPLIER_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value ?? '—';
}

export function supplierDisplayName(row: {
  legalName: string;
  tradeName?: string | null;
}) {
  return row.tradeName ? `${row.legalName} (${row.tradeName})` : row.legalName;
}
