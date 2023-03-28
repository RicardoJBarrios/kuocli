import { Tree } from '@nrwl/devkit';

/**
 * Gets a parsed JSON file value.
 * @param tree Virtual file system tree.
 * @param filePath Path of the JSON file.
 * @returns The parsed JSON file value or null if the file doesn't exist or is not a valid JSON file.
 */
export function getJsonFile(tree: Tree, filePath: string): Record<string, unknown> | null {
  const jsonString: string = tree.read(filePath, 'utf8');
  try {
    return jsonString ? JSON.parse(jsonString) : null;
  } catch {
    return null;
  }
}
