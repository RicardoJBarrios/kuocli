import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addIdePluginRecommendations } from './add-ide-plugin-recommendations';
import { getJsonFile } from './get-json-file';

describe('addIdePluginRecommendations', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`creates the extensions file`, () => {
    addIdePluginRecommendations(tree);
    const file = getJsonFile(tree, '.vscode/extensions.json');
    expect(file).toEqual({ recommendations: [] });
  });

  it(`updates the extensions file`, () => {
    tree.write('.vscode/extensions.json', JSON.stringify({ recommendations: ['rec1'] }));
    addIdePluginRecommendations(tree, 'rec2');
    const file = getJsonFile(tree, '.vscode/extensions.json');
    expect(file).toEqual({ recommendations: ['rec1', 'rec2'] });
  });

  it(`returns [] if no extensions`, () => {
    expect(addIdePluginRecommendations(tree)).toEqual({ recommendations: [] });
  });

  it(`returns a single recommendations`, () => {
    expect(addIdePluginRecommendations(tree, 'rec1')).toEqual({ recommendations: ['rec1'] });
  });

  it(`returns multiple recommendations`, () => {
    expect(addIdePluginRecommendations(tree, 'rec1', 'rec2')).toEqual({ recommendations: ['rec1', 'rec2'] });
  });

  it(`returns with existing recommendations`, () => {
    addIdePluginRecommendations(tree, 'rec1');
    expect(addIdePluginRecommendations(tree, 'rec2')).toEqual({ recommendations: ['rec1', 'rec2'] });
  });

  it(`returns no duplicated recommendations`, () => {
    addIdePluginRecommendations(tree, 'rec1');
    expect(addIdePluginRecommendations(tree, 'rec1')).toEqual({ recommendations: ['rec1'] });
  });
});
