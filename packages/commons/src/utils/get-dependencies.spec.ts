import { Tree, updateJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { getDependencies } from './get-dependencies';

function addAllDefaultDependencies(tree: Tree) {
  updateJson(tree, 'package.json', (json) => ({
    ...json,
    ...{
      dependencies: { dep: '' },
      devDependencies: { devDep: '' },
      peerDependencies: { peerDep: '' },
      peerDependenciesMeta: { peerDepMeta: '' },
      bundleDependencies: { bundleDep: '' },
      optionalDependencies: { optDep: '' }
    }
  }));
}

describe('getDependencies', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`returns [] if no dependencies`, () => {
    const deps: string[] = getDependencies(tree);
    expect(deps).toEqual([]);
  });

  it(`returns all the library names if no filter`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree);
    expect(deps).toEqual(['dep', 'devDep', 'peerDep', 'peerDepMeta', 'bundleDep', 'optDep']);
  });

  it(`returns the library names filtering by 'dependencies'`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree, 'dependencies');
    expect(deps).toEqual(['dep']);
  });

  it(`returns the library names filtering by 'devDependencies'`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree, 'devDependencies');
    expect(deps).toEqual(['devDep']);
  });

  it(`returns the library names filtering by 'peerDependencies'`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree, 'peerDependencies');
    expect(deps).toEqual(['peerDep']);
  });

  it(`returns the library names filtering by 'peerDependenciesMeta'`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree, 'peerDependenciesMeta');
    expect(deps).toEqual(['peerDepMeta']);
  });

  it(`returns the library names filtering by 'bundleDependencies'`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree, 'bundleDependencies');
    expect(deps).toEqual(['bundleDep']);
  });

  it(`returns the library names filtering by 'optionalDependencies'`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree, 'optionalDependencies');
    expect(deps).toEqual(['optDep']);
  });

  it(`returns the library names filtering by multiple types names`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree, 'dependencies', 'devDependencies');
    expect(deps).toEqual(['dep', 'devDep']);
  });

  it(`returns the library names ignoring duplicated types`, () => {
    addAllDefaultDependencies(tree);
    const deps: string[] = getDependencies(tree, 'dependencies', 'dependencies');
    expect(deps).toEqual(['dep']);
  });
});
