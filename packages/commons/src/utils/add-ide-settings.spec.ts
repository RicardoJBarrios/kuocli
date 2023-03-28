import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addIdeSettings } from './add-ide-settings';
import { getJsonFile } from './get-json-file';

describe('addIdeSettings', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`creates the settings file`, () => {
    addIdeSettings(tree, {});
    const file = getJsonFile(tree, '.vscode/settings.json');
    expect(file).toEqual({});
  });

  it(`updates the settings file`, () => {
    tree.write('.vscode/settings.json', JSON.stringify({ a: 0 }));
    addIdeSettings(tree, { b: 0 });
    const file = getJsonFile(tree, '.vscode/settings.json');
    expect(file).toEqual({ a: 0, b: 0 });
  });

  it(`returns {} if no settings`, () => {
    expect(addIdeSettings(tree, {})).toEqual({});
  });

  it(`returns the added settings`, () => {
    expect(addIdeSettings(tree, { a: 0 })).toEqual({ a: 0 });
  });

  it(`returns merged settings with existing`, () => {
    addIdeSettings(tree, { a: 0 });
    expect(addIdeSettings(tree, { b: 0 })).toEqual({ a: 0, b: 0 });
  });
});
