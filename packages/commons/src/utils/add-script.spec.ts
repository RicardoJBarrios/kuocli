import { readJson, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { addScript } from './add-script';

describe('addScript', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`adds the new script`, () => {
    addScript(tree, 'a', 'a');
    expect(readJson(tree, 'package.json')).toEqual(expect.objectContaining({ scripts: { a: 'a' } }));
  });

  it(`updates the script with the new code`, () => {
    addScript(tree, 'a', 'a');
    addScript(tree, 'a', 'b');
    expect(readJson(tree, 'package.json')).toEqual(expect.objectContaining({ scripts: { a: 'a && b' } }));
  });

  it(`updates the script without duplicated values`, () => {
    addScript(tree, 'a', 'a');
    addScript(tree, 'a', 'b');
    addScript(tree, 'a', 'a');
    expect(readJson(tree, 'package.json')).toEqual(expect.objectContaining({ scripts: { a: 'a && b' } }));
  });

  it(`updates the script without whole duplicated values`, () => {
    addScript(tree, 'a', 'aa');
    addScript(tree, 'a', 'a');
    expect(readJson(tree, 'package.json')).toEqual(expect.objectContaining({ scripts: { a: 'aa && a' } }));
  });

  it(`updates merging with other scripts`, () => {
    addScript(tree, 'a', 'a');
    addScript(tree, 'b', 'a');
    addScript(tree, 'c', 'a');
    expect(readJson(tree, 'package.json')).toEqual(expect.objectContaining({ scripts: { a: 'a', b: 'a', c: 'a' } }));
  });
});
