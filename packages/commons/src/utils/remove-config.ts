import { readJson, Tree, updateJson } from '@nrwl/devkit';
import get from 'lodash/get';
import set from 'lodash/set';

const packageJsonPath = 'package.json';

/**
 * Removes a config value in package.json or a config file.
 * @param tree Virtual file system tree.
 * @param path The config path in package.json or the config file prefix.
 * Will check all known valid config suffixes.
 * @returns The deleted config value.
 *
 * @example
 * ```ts
 * removeConfig(tree, 'test'); // deletes .testrc; returns the content
 * ```
 */
export function removeConfig(tree: Tree, path: string): string | undefined {
  const value: string | undefined = removeFromPackageJson(tree, path);

  return removeFromFile(tree, path, value);
}

function removeFromPackageJson(tree: Tree, path: string): string | undefined {
  const json = readJson(tree, packageJsonPath);
  const value: string | undefined = get(json, path);

  if (value !== undefined) {
    updateJson(tree, packageJsonPath, (json) => {
      set(json, path, undefined);
      return json;
    });
  }

  return value;
}

function removeFromFile(tree: Tree, prefix: string, value?: string): string | undefined {
  const suffixes = [
    '.*rc',
    '.*rc.json',
    '.*rc.yml',
    '.*rc.yaml',
    '.*rc.json5',
    '.*rc.js',
    '.*rc.cjs',
    '*.config.js',
    '*.config.cjs'
  ];
  let index = 0;

  while (value === undefined && index < suffixes.length) {
    const filePath = suffixes[index].replace('*', prefix);

    if (tree.exists(filePath)) {
      value = tree.read(filePath, 'utf-8');
      tree.delete(filePath);
    }

    index += 1;
  }

  return value;
}
