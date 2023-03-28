import { Tree } from '@nrwl/devkit';
import { isObject } from 'lodash';

import { cleanStringArray } from './clean-string-array';
import { DEPENDENCY_TYPE } from './dependency-type';
import { getJsonFile } from './get-json-file';

/**
 * Gets the list of library names in the workspace package.json dependencies.
 * @param tree Virtual file system tree.
 * @param filterTypes A list to filter by dependency types.
 * @returns The list of library names in the workspace package.json dependencies.
 */
export function getWorkspaceDependencies(tree: Tree, ...filterTypes: DEPENDENCY_TYPE[]): string[] {
  const json = getJsonFile(tree, 'package.json');
  const types: DEPENDENCY_TYPE[] =
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

  return json != null
    ? cleanStringArray(
        types.reduce((keys: DEPENDENCY_TYPE[], type: DEPENDENCY_TYPE) => {
          if (isObject(json[type])) {
            return [...keys, ...Object.keys(json[type])];
          }
          return keys;
        }, [])
      )
    : [];
}
