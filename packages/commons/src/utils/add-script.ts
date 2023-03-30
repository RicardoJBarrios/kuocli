import { Tree, updateJson } from '@nrwl/devkit';
import mergeWith from 'lodash/mergeWith';

/**
 * Adds a script to the package.json
 * @param tree File system tree
 * @param scriptName Name of the script
 * @param scriptCode Code of the script
 */
export function addScript(tree: Tree, scriptName: string, scriptCode: string): void {
  const customizer = (objValue: unknown, srcValue: unknown) => {
    if (typeof objValue === 'string' && typeof srcValue === 'string') {
      return objValue.includes(srcValue) ? objValue : `${objValue} && ${srcValue}`;
    }
  };

  updateJson(tree, 'package.json', (json) => {
    return mergeWith(json, { scripts: { [scriptName]: scriptCode } }, customizer);
  });
}
