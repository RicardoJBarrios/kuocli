import { Tree, updateJson, writeJson } from '@nrwl/devkit';

import { mergeWithArray } from './merge-with-array';

/**
 * Creates or updates the IDE extension recommendations
 * @param tree File system tree
 * @param extensions List of extension names
 */
export function upsertIDEExtensionRecommendations(tree: Tree, ...extensions: string[]): void {
  const path = '.vscode/extensions.json';
  const updater = (value: Record<string, unknown>) => {
    return mergeWithArray(value, { recommendations: extensions });
  };

  tree.exists(path) ? updateJson(tree, path, updater) : writeJson(tree, path, updater({}));
}
