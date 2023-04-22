import { Tree } from '@nrwl/devkit';

export function upsertHuskyHook(tree: Tree, hook: string, ...scripts: string[]): void {
  const path = `.husky/${hook}`;

  if (!tree.exists(path)) {
    const content = `#!/bin/sh \n. "$(dirname "$0")/_/husky.sh"\n`;
    tree.write(path, content, { mode: '755' });
  }

  if (scripts.length > 0) {
    const hookContent = tree.read(path, 'utf-8').toString();
    const noDuplicatedScripts = scripts.filter((s) => !hookContent.includes(s));

    if (noDuplicatedScripts.length > 0) {
      tree.write(path, `${hookContent}\n${noDuplicatedScripts.join('\n')}`);
    }
  }
}
