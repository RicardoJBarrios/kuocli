import { Tree, updateJson, writeJson } from '@nrwl/devkit';

import { mergeWithArray } from './merge-with-array';

/**
 * Creates or updates the VSCode settings file with the settings.
 * @param tree File system tree.
 * @param settings VSCode settings.
 *
 * @example
 * ```ts
 * upsertVSCodeSettings(tree, { a: 0 }); // { "a": 0 }
 * upsertVSCodeSettings(tree, { b: 0 }); // { "a": 0, "b": 0 }
 * ```
 */
export function upsertVSCodeSettings(tree: Tree, settings: Record<string, unknown>): void {
  const path = '.vscode/settings.json';
  const updater = (value: Record<string, unknown>) => {
    return mergeWithArray(value, settings);
  };

  tree.exists(path) ? updateJson(tree, path, updater) : writeJson(tree, path, updater({}));
}
