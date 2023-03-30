import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { upsertIDESettings } from './upsert-ide-settings';

const path = '.vscode/settings.json';

describe('upsertIDESettings', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`creates the IDE settings file with the new settings`, () => {
    upsertIDESettings(tree, { a: 0 });
    expect(readJson(tree, path)).toEqual({ a: 0 });
  });

  it(`updates the IDE settings file with the new settings`, () => {
    writeJson(tree, path, { a: 0 });
    upsertIDESettings(tree, { b: 0 });
    expect(readJson(tree, path)).toEqual({ a: 0, b: 0 });
  });

  it(`upserts deep settings and arrays`, () => {
    writeJson(tree, path, { a: { a: [0] } });
    upsertIDESettings(tree, { a: { a: [1], b: 0 } });
    expect(readJson(tree, path)).toEqual({ a: { a: [0, 1], b: 0 } });
  });
});
