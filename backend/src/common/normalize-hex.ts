/** Normaliza hex a #RRGGBB para almacenar en hex_approx (CHAR(7)). */
export function normalizeHexApprox(hex?: string | null): string | undefined {
  if (hex == null || String(hex).trim() === '') return undefined;
  const raw = String(hex).trim();
  const bare = raw.startsWith('#') ? raw.slice(1) : raw;
  let six = bare;
  if (/^[0-9A-Fa-f]{3}$/.test(bare)) {
    six = bare
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(six)) return undefined;
  return `#${six.toUpperCase()}`;
}
