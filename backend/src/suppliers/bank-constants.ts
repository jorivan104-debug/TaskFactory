export const BANK_ENTITIES = [
  'bancolombia',
  'banco_bogota',
  'banco_popular',
  'banco_davivienda',
  'nu',
  'nequi',
  'daviplata',
] as const;

export type BankEntity = (typeof BANK_ENTITIES)[number];

export const BANK_ACCOUNT_TYPES = ['ahorros', 'corriente'] as const;

export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[number];
