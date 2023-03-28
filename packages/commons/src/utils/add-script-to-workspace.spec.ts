import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addScriptToWorkspace } from './add-script-to-workspace';
import { getJsonFile } from './get-json-file';

const packageJson = { name: 'test-name', dependencies: {}, devDependencies: {} };

describe('addScriptToWorkspace', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`updates the package.json file with the new script`, () => {
    addScriptToWorkspace(tree, 'test', 'echo TEST');
    const file = getJsonFile(tree, 'package.json');
    expect(file).toEqual({ ...packageJson, scripts: { test: 'echo TEST' } });
  });

  it(`returns the package.json file value with the new script`, () => {
    expect(addScriptToWorkspace(tree, 'test', 'echo TEST')).toEqual({ ...packageJson, scripts: { test: 'echo TEST' } });
  });

  it(`returns the package.json file value adding the script value to existing name`, () => {
    addScriptToWorkspace(tree, 'test', 'echo TEST1 && echo TEST2');
    expect(addScriptToWorkspace(tree, 'test', 'echo TEST3')).toEqual({
      ...packageJson,
      scripts: { test: 'echo TEST1 && echo TEST2 && echo TEST3' }
    });
  });

  it(`returns the package.json file value without adding the script to existing value in name`, () => {
    addScriptToWorkspace(tree, 'test', 'echo TEST1 && echo TEST2');
    expect(addScriptToWorkspace(tree, 'test', 'echo TEST1')).toEqual({
      ...packageJson,
      scripts: { test: 'echo TEST1 && echo TEST2' }
    });
  });

  it(`doesn't change other names`, () => {
    addScriptToWorkspace(tree, 'test1', 'echo TEST1');
    addScriptToWorkspace(tree, 'test2', 'echo TEST2');
    addScriptToWorkspace(tree, 'test3', 'echo TEST3');
    expect(addScriptToWorkspace(tree, 'test3', 'echo TEST31')).toEqual({
      ...packageJson,
      scripts: { test1: 'echo TEST1', test2: 'echo TEST2', test3: 'echo TEST3 && echo TEST31' }
    });
  });
});
