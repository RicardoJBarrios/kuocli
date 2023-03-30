import { addProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getProjectNamesByType } from './get-project-names-by-type';

describe('getProjectNamesByType', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`returns [] if no projects`, () => {
    expect(getProjectNamesByType(tree, 'application')).toEqual([]);
    expect(getProjectNamesByType(tree, 'library')).toEqual([]);
  });

  it(`returns the applications names`, () => {
    addProjectConfiguration(tree, 'app1', {
      projectType: 'application',
      root: 'apps/app1'
    });
    expect(getProjectNamesByType(tree, 'application')).toEqual(['app1']);
    expect(getProjectNamesByType(tree, 'library')).toEqual([]);
  });

  it(`returns the libraries names`, () => {
    addProjectConfiguration(tree, 'lib1', {
      projectType: 'library',
      root: 'libs/lib1'
    });
    expect(getProjectNamesByType(tree, 'application')).toEqual([]);
    expect(getProjectNamesByType(tree, 'library')).toEqual(['lib1']);
  });
});
