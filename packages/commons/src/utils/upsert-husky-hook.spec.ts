import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { upsertHuskyHook } from './upsert-husky-hook';

const hook = 'pre-commit';
const path = `.husky/${hook}`;
const content = `#!/bin/sh \n. "$(dirname "$0")/_/husky.sh"\n`;

describe('upsertHuskyHook', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`creates the empty hook`, () => {
    upsertHuskyHook(tree, hook);
    expect(tree.read(path, 'utf-8')).toEqual(content);
  });

  it(`creates the hook with the scripts`, () => {
    upsertHuskyHook(tree, hook, 'echo A', 'echo B');
    expect(tree.read(path, 'utf-8')).toEqual(`${content}\necho A\necho B`);
  });

  it(`updates the hook with the scripts`, () => {
    upsertHuskyHook(tree, hook, 'echo A');
    upsertHuskyHook(tree, hook, 'echo B');
    expect(tree.read(path, 'utf-8')).toEqual(`${content}\necho A\necho B`);
  });

  it(`upserts the hook without duplicates`, () => {
    upsertHuskyHook(tree, hook, 'echo A');
    upsertHuskyHook(tree, hook, 'echo B');
    upsertHuskyHook(tree, hook, 'echo A');
    expect(tree.read(path, 'utf-8')).toEqual(`${content}\necho A\necho B`);
  });

  it(`upserts the hook respecting partials`, () => {
    upsertHuskyHook(tree, hook, 'echo AL && echo B');
    upsertHuskyHook(tree, hook, 'echo B');
    upsertHuskyHook(tree, hook, 'echo A');
    expect(tree.read(path, 'utf-8')).toEqual(`${content}\necho AL && echo B\necho A`);
  });
});
