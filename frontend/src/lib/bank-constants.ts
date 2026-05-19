export const BANK_ENTITY_OPTIONS = [
  { value: 'bancolombia', label: 'Bancolombia' },
  { value: 'banco_bogota', label: 'Banco de Bogotá' },
  { value: 'banco_popular', label: 'Banco Popular' },
  { value: 'banco_davivienda', label: 'Banco Davivienda' },
  { value: 'nu', label: 'NU' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
] as const;

export const BANK_ACCOUNT_TYPE_OPTIONS = [
  { value: 'ahorros', label: 'Ahorros' },
  { value: 'corriente', label: 'Corriente' },
] as const;

export function bankEntityLabel(value?: string | null): string {
  return BANK_ENTITY_OPTIONS.find((o) => o.value === value)?.label ?? value ?? '—';
}

export function bankAccountTypeLabel(value?: string | null): string {
  return BANK_ACCOUNT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value ?? '—';
}
