export const SILHOUETTE_GENDERS = ['Dama', 'Caballero', 'Niño', 'Niña', 'Unisex'] as const;
export type SilhouetteGender = (typeof SILHOUETTE_GENDERS)[number];
