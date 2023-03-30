import { Tree, updateJson, writeJson } from '@nrwl/devkit';

import { mergeWithArray } from './merge-with-array';

/**
 * Creates or updates the IDE settings file with the settings argument
 * @param tree File system tree
 * @param settings IDE settings
 */
export function upsertIDESettings(tree: Tree, settings: Record<string, unknown>): void {
  const path = '.vscode/settings.json';
  const updater = (value: Record<string, unknown>) => {
    return mergeWithArray(value, settings);
  };

  tree.exists(path) ? updateJson(tree, path, updater) : writeJson(tree, path, updater({}));
}
