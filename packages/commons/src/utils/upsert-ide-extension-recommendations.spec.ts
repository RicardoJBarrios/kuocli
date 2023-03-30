import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { upsertIDEExtensionRecommendations } from './upsert-ide-extension-recommendations';

const path = '.vscode/extensions.json';

describe('upsertIDEExtensionRecommendations', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`creates the IDE extensions file with the new recommendations`, () => {
    upsertIDEExtensionRecommendations(tree, 'a', 'b');
    expect(readJson(tree, path)).toEqual({ recommendations: ['a', 'b'] });
  });

  it(`updates the IDE extensions file with the new recommendations`, () => {
    writeJson(tree, path, { recommendations: ['a'] });
    upsertIDEExtensionRecommendations(tree, 'b');
    expect(readJson(tree, path)).toEqual({ recommendations: ['a', 'b'] });
  });

  it(`upserts the IDE extensions file recommendations without duplicates`, () => {
    writeJson(tree, path, { recommendations: ['a'] });
    upsertIDEExtensionRecommendations(tree, 'a', 'b');
    expect(readJson(tree, path)).toEqual({ recommendations: ['a', 'b'] });
  });
});
