import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getJsonFile } from './get-json-file';
import { upsertJsonFile } from './upsert-json-file';

const packageJson = { name: 'test-name', dependencies: {}, devDependencies: {} };
const mutator = (json) => ({ ...json, test: 'test' });

describe('upsertJsonFile', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`creates a json file`, () => {
    const fileName = 'nofile.json';
    upsertJsonFile(tree, fileName, mutator);
    const file = getJsonFile(tree, fileName);
    expect(file).toEqual({ test: 'test' });
  });

  it(`returns the created json file value`, () => {
    expect(upsertJsonFile(tree, 'nofile.json', mutator)).toEqual({ test: 'test' });
  });

  it(`updates a json file`, () => {
    const fileName = 'package.json';
    upsertJsonFile(tree, fileName, mutator);
    const file = getJsonFile(tree, fileName);
    expect(file).toEqual({ ...packageJson, test: 'test' });
  });

  it(`returns the updated json file value`, () => {
    expect(upsertJsonFile(tree, 'package.json', mutator)).toEqual({ ...packageJson, test: 'test' });
  });

  it(`returns null if is not a valid JSON file`, () => {
    jest.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw new Error();
    });
    expect(upsertJsonFile(tree, 'package.json', mutator)).toBeNull();
  });

  it(`returns null if the mutator throws`, () => {
    expect(
      upsertJsonFile(tree, 'package.json', () => {
        throw new Error();
      })
    ).toBeNull();
  });

  it(`The file is not created if returns null`, () => {
    jest.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw new Error();
    });
    const fileName = 'nofile.json';
    upsertJsonFile(tree, fileName, mutator);
    const file = getJsonFile(tree, fileName);
    expect(file).toBeNull();
  });

  it(`The file is not updated if returns null`, () => {
    jest.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw new Error();
    });
    const fileName = 'package.json';
    upsertJsonFile(tree, fileName, mutator);
    const file = getJsonFile(tree, fileName);
    expect(file).toEqual(packageJson);
  });
});
