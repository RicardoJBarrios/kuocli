import mergeWith from 'lodash/mergeWith';

import { cleanStringArray } from './clean-string-array';

/**
 * Merges properties of source objects to the destination object concatenating Arrays without duplicates
 * @param obj Destination object
 * @param sources Source objects
 * @returns The merged objects
 */
export function mergeWithArray<T = Record<string, unknown>>(obj: T, ...sources: object[]): T {
  const customizer = (objValue: object, srcValue: unknown) => {
    if (Array.isArray(objValue)) {
      return cleanStringArray(objValue.concat(srcValue));
    }
  };

  return mergeWith(obj, ...sources, customizer);
}
