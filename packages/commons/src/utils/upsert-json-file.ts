import { Tree } from '@nrwl/devkit';

import { getJsonFile } from './get-json-file';

/**
 * Creates or updates a JSON file.
 * @param tree Virtual file system tree.
 * @param filePath Path of the JSON file.
 * @param mutator Function to mutate the JSON file.
 * @returns The mutated JSON or null if the content is not a valid JSON file or throws.
 */
export function upsertJsonFile(
  tree: Tree,
  filePath: string,
  mutator: (json: Record<string, unknown>) => Record<string, unknown>
): Record<string, unknown> | null {
  let jsonValue: Record<string, unknown> = getJsonFile(tree, filePath) ?? {};
  try {
    jsonValue = mutator(jsonValue);
    tree.write(filePath, JSON.stringify(jsonValue));
  } catch {
    return null;
  }

  return jsonValue;
}
