import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { removeConfig } from './remove-config';

describe('removeConfig', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`returns undefined if no config`, () => {
    const value = removeConfig(tree, 'a');
    expect(value).toBeUndefined();
  });

  it(`deletes path from package.json`, () => {
    tree.write('package.json', '{"a":{"a":0,"b":0}}');
    removeConfig(tree, 'a.a');
    expect(JSON.parse(tree.read('package.json', 'utf-8'))).toEqual({ a: { b: 0 } });
  });

  it(`returns path from package.json`, () => {
    tree.write('package.json', '{"a":{"a":0,"b":0}}');
    const value = removeConfig(tree, 'a.a');
    expect(value).toEqual(0);
  });

  it(`deletes the .*rc file`, () => {
    tree.write('.testrc', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('.testrc')).toEqual(false);
  });

  it(`returns value from .*rc file`, () => {
    const fileValue = '{a:0}';
    tree.write('.testrc', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });

  it(`deletes the .*rc.json file`, () => {
    tree.write('.testrc.json', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('.testrc.json')).toEqual(false);
  });

  it(`returns value from .*rc.json file`, () => {
    const fileValue = '{a:0}';
    tree.write('.testrc.json', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });

  it(`deletes the .*rc.yml file`, () => {
    tree.write('.testrc.yml', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('.testrc.yml')).toEqual(false);
  });

  it(`returns value from .*rc.yml file`, () => {
    const fileValue = '{a:0}';
    tree.write('.testrc.yml', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });

  it(`deletes the .*rc.yaml file`, () => {
    tree.write('.testrc.yaml', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('.testrc.yaml')).toEqual(false);
  });

  it(`returns value from .*rc.yaml file`, () => {
    const fileValue = '{a:0}';
    tree.write('.testrc.yaml', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });

  it(`deletes the .*rc.json5 file`, () => {
    tree.write('.testrc.json5', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('.testrc.json5')).toEqual(false);
  });

  it(`returns value from .*rc.json5 file`, () => {
    const fileValue = '{a:0}';
    tree.write('.testrc.json5', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });

  it(`deletes the .*rc.js file`, () => {
    tree.write('.testrc.js', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('.testrc.js')).toEqual(false);
  });

  it(`returns value from .*rc.js file`, () => {
    const fileValue = '{a:0}';
    tree.write('.testrc.js', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });

  it(`deletes the .*rc.cjs file`, () => {
    tree.write('.testrc.cjs', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('.testrc.cjs')).toEqual(false);
  });

  it(`returns value from .*rc.cjs file`, () => {
    const fileValue = '{a:0}';
    tree.write('.testrc.cjs', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });

  it(`deletes the *.config.js file`, () => {
    tree.write('test.config.js', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('test.config.js')).toEqual(false);
  });

  it(`returns value from *.config.js file`, () => {
    const fileValue = '{a:0}';
    tree.write('test.config.js', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });

  it(`deletes the *.config.cjs file`, () => {
    tree.write('test.config.cjs', '{a:0}');
    removeConfig(tree, 'test');
    expect(tree.exists('test.config.cjs')).toEqual(false);
  });

  it(`returns value from *.config.cjs file`, () => {
    const fileValue = '{a:0}';
    tree.write('test.config.cjs', fileValue);
    const value = removeConfig(tree, 'test');
    expect(value).toEqual(fileValue);
  });
});
