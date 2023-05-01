import { Tree } from '@nx/devkit';

import { stringContains } from './string-contains';

/**
 * Creates or updates a Husky hook avoiding repeat code.
 * @param tree Virtual file system tree.
 * @param hook Husky hook.
 * @param scripts List of scripts to add.
 *
 * @example
 * ```ts
 * upsertHuskyHook(tree,'pre-commit','echo A','echo B', 'echo A');
 * // creates or updates .husky/pre-commit
 * // adds "echo A\necho B" to the hook
 * ```
 */
export function upsertHuskyHook(tree: Tree, hook: string, ...scripts: string[]): void {
  const path = `.husky/${hook}`;

  if (!tree.exists(path)) {
    const content = `#!/bin/sh \n. "$(dirname "$0")/_/husky.sh"\n`;
    tree.write(path, content, { mode: '755' });
  }

  if (scripts.length > 0) {
    const hookContent = tree.read(path, 'utf-8');
    const noDuplicatedScripts = scripts.filter((script) => !stringContains(hookContent, script));

    if (noDuplicatedScripts.length > 0) {
      tree.write(path, `${hookContent}\n${noDuplicatedScripts.join('\n')}`);
    }
  }
}
