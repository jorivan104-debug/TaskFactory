/** Permite serializar BigInt en respuestas JSON de Nest/Express. */
export function enableBigIntJsonSerialization(): void {
  // eslint-disable-next-line no-extend-native
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function toJSON() {
    return this.toString();
  };
}
