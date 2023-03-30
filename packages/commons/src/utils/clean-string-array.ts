/**
 * Cleans values from an Array of strings
 * @param array The Array to clean
 * @returns The Array without duplicates, nil or empty values or value's ending and trailing white space
 */
export function cleanStringArray(array: string[]): string[] {
  return [...new Set(array.map((s) => (typeof s === 'string' ? s.trim() : s)).filter((s) => s))];
}
