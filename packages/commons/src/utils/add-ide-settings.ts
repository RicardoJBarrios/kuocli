import { Tree } from '@nrwl/devkit';
import { merge } from 'lodash';

import { upsertJsonFile } from './upsert-json-file';

/**
 * Adds settings to the IDE.
 * @param tree Virtual file system tree.
 * @param settings IDE settings.
 * @returns The updated IDE settings.
 */
export function addIdeSettings(tree: Tree, settings: Record<string, unknown>): Record<string, unknown> {
  return upsertJsonFile(tree, '.vscode/settings.json', (json) => {
    return merge(json, settings);
  });
}
