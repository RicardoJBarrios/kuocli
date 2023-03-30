import { Tree } from '@nrwl/devkit';
import mergeWith from 'lodash/mergeWith';

import { upsertJsonFile } from './upsert-json-file';

/**
 * Adds a script to the workspace's package.json.
 *
 * If the script name exists and is not duplicated, adds the code to be executed after the current code.
 * @param tree Virtual file system tree.
 * @param scriptName The name of the script.
 * @param scriptCode The code of the script.
 * @returns The package.json value with the new script.
 */
export function addScriptToWorkspace(tree: Tree, scriptName: string, scriptCode: string) {
  const customizer = (objValue: unknown, srcValue: unknown) => {
    if (typeof objValue === 'string' && typeof srcValue === 'string') {
      return objValue.includes(srcValue) ? objValue : `${objValue} && ${srcValue}`;
    }
  };

  return upsertJsonFile(tree, 'package.json', (json) => {
    return mergeWith(json, { scripts: { [scriptName]: scriptCode } }, customizer);
  });
}
