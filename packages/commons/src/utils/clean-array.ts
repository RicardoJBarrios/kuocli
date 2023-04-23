/**
 * Cleans values from an Array.
 * @param array Array to clean.
 * @returns The Array without duplicates, nil or empty string values, and trimmed strings.
 *
 * @example
 * ```ts
 * cleanArray(['a ', '', null, undefined, ' a']); // ['a']
 * ```
 */
export function cleanArray<T>(array: T[]): T[] {
  return [...new Set(array.map(removeStringEndingAndTrailingSpaces).filter(nilAndEmptyString))];
}

function removeStringEndingAndTrailingSpaces<T>(value: T): T {
  return typeof value === 'string' ? (value.trim() as T) : value;
}

function nilAndEmptyString<T>(value: T): boolean {
  return value != null && value !== '';
}
