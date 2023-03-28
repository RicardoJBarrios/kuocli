import { Tree } from '@nrwl/devkit';
import { get } from 'lodash';

import { cleanStringArray } from './clean-string-array';
import { upsertJsonFile } from './upsert-json-file';

/**
 * Adds plugin recommendations to the IDE.
 * @param tree Virtual file system tree.
 * @param extensions List of plugin names.
 * @returns The updated IDE plugin recommendations.
 */
export function addIdePluginRecommendations(tree: Tree, ...extensions: string[]): Record<string, unknown> {
  return upsertJsonFile(tree, '.vscode/extensions.json', (json) => {
    const recommendations = get(json, 'recommendations', []) as string[];
    recommendations.push(...extensions);

    return { ...json, ...{ recommendations: cleanStringArray(recommendations) } };
  });
}
