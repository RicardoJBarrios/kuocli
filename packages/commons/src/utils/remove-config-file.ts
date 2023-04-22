import { readJson, Tree, updateJson } from '@nrwl/devkit';
import get from 'lodash/get';
import set from 'lodash/set';

const packageJsonPath = 'package.json';

function removeFromPackageJson(tree: Tree, jsonPath: string): string | undefined {
  const json = readJson(tree, packageJsonPath);
  const value: string | undefined = get(json, jsonPath);

  if (value !== undefined) {
    updateJson(tree, packageJsonPath, (json) => {
      set(json, jsonPath, undefined);
      return json;
    });
  }

  return value;
}

function removeFromFile(tree: Tree, path: string, value?: string): string | undefined {
  const suffixes = ['rc', 'rc.json', 'rc.yml', 'rc.yaml', 'rc.json5', 'rc.js', 'rc.cjs', '.config.js', '.config.cjs'];
  let index = 0;

  while (value !== undefined && index < suffixes.length) {
    const filePath = `${path}${suffixes[index]}`;
    if (tree.exists(filePath)) {
      value = tree.read(filePath, 'utf-8');
      tree.delete(filePath);
    }
    index += 1;
  }

  return value;
}

export function removeConfigFile(tree: Tree, path: string, jsonPath?: string): string | undefined {
  let value: string | undefined;

  if (jsonPath !== undefined) {
    value = removeFromPackageJson(tree, jsonPath);
  }

  return removeFromFile(tree, path, value);
}
