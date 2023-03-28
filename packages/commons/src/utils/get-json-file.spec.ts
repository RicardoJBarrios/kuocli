import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getJsonFile } from './get-json-file';

const packageJson = { name: 'test-name', dependencies: {}, devDependencies: {} };

describe('getJsonFile', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`returns the parsed JSON file value`, () => {
    expect(getJsonFile(tree, 'package.json')).toEqual(packageJson);
  });

  it(`returns null if file doesn't exist`, () => {
    expect(getJsonFile(tree, 'noFile.json')).toBeNull();
  });

  it(`returns null if file is not a valid JSON file`, () => {
    jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
      throw new Error();
    });
    expect(getJsonFile(tree, 'package.json')).toBeNull();
  });
});
