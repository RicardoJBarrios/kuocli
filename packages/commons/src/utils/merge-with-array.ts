import mergeWith from 'lodash/mergeWith';

function customizer(objValue: object, srcValue: unknown) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

/**
 * Merges properties, including Arrays, of source objects to the destination object.
 * @param obj The destination object.
 * @param sources The source objects.
 * @returns The merged objects.
 */
export function mergeWithArray<T extends Record<string, unknown>, K = T>(obj: T, ...sources: K[]): T | K {
  return mergeWith(obj, ...sources, customizer);
}
