import { Tree, updateJson, writeJson } from '@nrwl/devkit';

import { mergeWithArray } from './merge-with-array';

/**
 * Creates or updates the VSCode extension recommendations.
 * @param tree Virtual file system tree.
 * @param extensions List of extension names.
 *
 * @example
 * ```ts
 * upsertVSCodeRecommendations(tree,'ext1','ext2'); // { "recommendations": ["ext1","ext2"] }
 * ```
 */
export function upsertVSCodeRecommendations(tree: Tree, ...extensions: string[]): void {
  const path = '.vscode/extensions.json';
  const updater = (value: Record<string, unknown>) => {
    return mergeWithArray(value, { recommendations: extensions });
  };

  tree.exists(path) ? updateJson(tree, path, updater) : writeJson(tree, path, updater({}));
}
