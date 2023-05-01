import { readJson, Tree } from '@nx/devkit';
import isObject from 'lodash/isObject';

import { cleanArray } from './clean-array';

type DependencyType =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'peerDependenciesMeta'
  | 'bundleDependencies'
  | 'optionalDependencies';

/**
 * Gets the list of package names in package.json.
 * @param tree Virtual file system tree.
 * @param filterTypes List of package types to filter by.
 * @returns The filtered list of package names in package.json.
 *
 * @example
 * ```ts
 * getDependencies(tree); // ['pkg', 'devPkg']
 * getDependencies(tree, 'devDependencies'); // ['devPkg']
 * ```
 */
export function getDependencies(tree: Tree, ...filterTypes: DependencyType[]): string[] {
  const json = readJson(tree, 'package.json');
  const types: DependencyType[] =
    filterTypes.length > 0
      ? filterTypes
      : [
          'dependencies',
          'devDependencies',
          'peerDependencies',
          'peerDependenciesMeta',
          'bundleDependencies',
          'optionalDependencies'
        ];

  const packagesInTypes: string[] = types.reduce((keys: DependencyType[], type: DependencyType) => {
    if (isObject(json[type])) {
      return [...keys, ...Object.keys(json[type])];
    }

    return keys;
  }, []);

  return cleanArray(packagesInTypes);
}
