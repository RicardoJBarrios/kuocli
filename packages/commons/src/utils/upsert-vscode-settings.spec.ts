import { readJson, Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { upsertVSCodeSettings } from './upsert-vscode-settings';

const path = '.vscode/settings.json';

describe('upsertVSCodeSettings', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`creates the VSCode settings file with the new settings`, () => {
    upsertVSCodeSettings(tree, { a: 0 });
    expect(readJson(tree, path)).toEqual({ a: 0 });
  });

  it(`updates the VSCode settings file with the new settings`, () => {
    writeJson(tree, path, { a: 0 });
    upsertVSCodeSettings(tree, { b: 0 });
    expect(readJson(tree, path)).toEqual({ a: 0, b: 0 });
  });

  it(`upserts deep settings and arrays`, () => {
    writeJson(tree, path, { a: { a: [0] } });
    upsertVSCodeSettings(tree, { a: { a: [1], b: 0 } });
    expect(readJson(tree, path)).toEqual({ a: { a: [0, 1], b: 0 } });
  });
});
