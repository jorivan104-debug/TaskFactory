import { BadRequestException } from '@nestjs/common';

export const REFERENCE_TYPES = ['muestra', 'produccion'] as const;
export type ReferenceType = (typeof REFERENCE_TYPES)[number];

export function assertReferenceType(value: string): ReferenceType {
  if (!REFERENCE_TYPES.includes(value as ReferenceType)) {
    throw new BadRequestException(
      `referenceType must be one of: ${REFERENCE_TYPES.join(', ')}`,
    );
  }
  return value as ReferenceType;
}

export function seriePrefix(referenceType: ReferenceType): 'M' | 'P' {
  return referenceType === 'muestra' ? 'M' : 'P';
}

export function buildReferenceCode(
  brandConsecutivo: number,
  referenceSequence: number,
  serie: string,
): string {
  if (brandConsecutivo < 100 || brandConsecutivo > 999) {
    throw new BadRequestException('Brand consecutivo must be between 100 and 999');
  }
  if (referenceSequence < 100 || referenceSequence > 999) {
    throw new BadRequestException('Reference sequence must be between 100 and 999');
  }
  return `${brandConsecutivo}${String(referenceSequence).padStart(3, '0')}${serie}`;
}

type PrismaTx = {
  garmentReference: {
    findMany: (args: {
      where: { brandId: string; referenceType: string; serie?: { startsWith: string } };
      select: { serie: true };
    }) => Promise<{ serie: string }[]>;
    aggregate: (args: {
      where: { brandId: string };
      _max: { referenceSequence: true };
    }) => Promise<{ _max: { referenceSequence: number | null } }>;
  };
};

export async function allocateSerie(
  tx: PrismaTx,
  brandId: string,
  referenceType: ReferenceType,
): Promise<string> {
  const prefix = seriePrefix(referenceType);
  const existing = await tx.garmentReference.findMany({
    where: { brandId, referenceType, serie: { startsWith: prefix } },
    select: { serie: true },
  });

  let max = -1;
  for (const row of existing) {
    if (row.serie?.length === 3 && row.serie[0] === prefix) {
      const n = parseInt(row.serie.slice(1), 10);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    }
  }

  const next = max + 1;
  if (next > 99) {
    throw new BadRequestException(
      `No hay series disponibles para tipo ${referenceType} (máximo ${prefix}99)`,
    );
  }
  return `${prefix}${String(next).padStart(2, '0')}`;
}

export async function allocateReferenceSequence(
  tx: PrismaTx,
  brandId: string,
): Promise<number> {
  const agg = await tx.garmentReference.aggregate({
    where: { brandId },
    _max: { referenceSequence: true },
  });
  const next = (agg._max.referenceSequence ?? 99) + 1;
  if (next > 999) {
    throw new BadRequestException('Reference sequence exhausted for this brand (max 999)');
  }
  return next;
}
