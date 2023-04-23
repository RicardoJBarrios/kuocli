import mergeWith from 'lodash/mergeWith';

import { cleanArray } from './clean-array';

/**
 * Deep merges properties of source objects to the destination object.
 * @param obj Destination object.
 * @param sources Source objects.
 * @returns The merged objects, concatenating Arrays without duplicates or empty values.
 *
 * @example
 * ```ts
 * const a = { a: [0, 1], b: { a: 0, b: 0 } };
 * const b = { a: [0, 2], b: { a: 1, c: 0 } };
 * mergeWithArray(a, b); // { a: [0, 1, 2], b: { a: 1, b: 0, c: 0 } }
 * ```
 */
export function mergeWithArray<T = Record<string, unknown>>(obj: T, ...sources: object[]): T {
  return mergeWith(obj, ...sources, customizer);
}

function customizer(objValue: unknown, srcValue: unknown): unknown[] | undefined {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return cleanArray(objValue.concat(srcValue));
  }
}
