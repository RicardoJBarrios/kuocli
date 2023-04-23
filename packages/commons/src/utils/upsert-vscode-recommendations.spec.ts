import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { upsertVSCodeRecommendations } from './upsert-vscode-recommendations';

const path = '.vscode/extensions.json';

describe('upsertVSCodeRecommendations', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`creates the VSCode extensions file with the new recommendations`, () => {
    upsertVSCodeRecommendations(tree, 'a', 'b');
    expect(readJson(tree, path)).toEqual({ recommendations: ['a', 'b'] });
  });

  it(`updates the VSCode extensions file with the new recommendations`, () => {
    writeJson(tree, path, { recommendations: ['a'] });
    upsertVSCodeRecommendations(tree, 'b');
    expect(readJson(tree, path)).toEqual({ recommendations: ['a', 'b'] });
  });

  it(`upserts the VSCode extensions file recommendations without duplicates`, () => {
    writeJson(tree, path, { recommendations: ['a'] });
    upsertVSCodeRecommendations(tree, 'a', 'b');
    expect(readJson(tree, path)).toEqual({ recommendations: ['a', 'b'] });
  });
});
