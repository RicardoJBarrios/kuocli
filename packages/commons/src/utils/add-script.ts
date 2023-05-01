import { Tree, updateJson } from '@nx/devkit';
import mergeWith from 'lodash/mergeWith';

import { stringContains } from './string-contains';

/**
 * Adds a script to the package.json avoiding repeat code.
 * @param tree Virtual file system tree.
 * @param name Name of the script.
 * @param code Code of the script.
 *
 * @example
 * ```ts
 * addScript(tree, 'a', 'a'); // { scripts: { a: 'a' } }
 * addScript(tree, 'a', 'a'); // { scripts: { a: 'a' } }
 * addScript(tree, 'a', 'b'); // { scripts: { a: 'a && b' } }
 * ```
 */
export function addScript(tree: Tree, name: string, code: string): void {
  updateJson(tree, 'package.json', (json) => {
    return mergeWith(json, { scripts: { [name]: code } }, customizer);
  });
}

function customizer(objValue: unknown, srcValue: unknown): string | undefined {
  if (typeof objValue === 'string' && typeof srcValue === 'string') {
    return stringContains(objValue, srcValue) ? objValue : `${objValue} && ${srcValue}`;
  }
}
