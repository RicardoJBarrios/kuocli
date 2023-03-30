import { readJson, Tree } from '@nrwl/devkit';
import isObject from 'lodash/isObject';

import { cleanStringArray } from './clean-string-array';

type DependencyType =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'peerDependenciesMeta'
  | 'bundleDependencies'
  | 'optionalDependencies';

/**
 * Gets the list of package names in package.json
 * @param tree File system tree
 * @param filterTypes List of package types to filter by
 * @returns The filtered list of package names in package.json
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

  return cleanStringArray(
    types.reduce((keys: DependencyType[], type: DependencyType) => {
      if (isObject(json[type])) {
        return [...keys, ...Object.keys(json[type])];
      }
      return keys;
    }, [])
  );
}
