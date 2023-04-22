/**
 * Cleans values from an Array
 * @param array Array to clean
 * @returns The Array without duplicates, nil or empty string values, and trimmed strings
 */
export function cleanArray<T>(array: T[]): T[] {
  const removeEndingAndTrailing = (s: T): T => (typeof s === 'string' ? (s.trim() as T) : s);
  const filferNilAndEmptyString = (s: T): boolean => s != null && s !== '';

  return [...new Set(array.map(removeEndingAndTrailing).filter(filferNilAndEmptyString))];
}
