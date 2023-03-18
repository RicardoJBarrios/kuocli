import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { addProjectConfiguration, Tree } from '@nrwl/devkit';
import * as devKit from '@nrwl/devkit';
import { getJsonFile, getPackageJsonDevDepsKeys } from '../../utils';
import generator from './generator';

describe('Git Lint Generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    addProjectConfiguration(tree, 'app1', {
      projectType: 'application',
      sourceRoot: 'apps/app1/src',
      root: 'apps/app1',
    });
    addProjectConfiguration(tree, 'lib1', {
      projectType: 'library',
      sourceRoot: 'libs/lib1/src',
      root: 'libs/lib1',
    });
  });

  it('creates .husky/commit-msg', async () => {
    await generator(tree, {});
    const file = tree.exists('.husky/commit-msg');
    expect(file).toBeTruthy();
  });

  it('creates .husky/prepare-commit-msg', async () => {
    await generator(tree, {});
    const file = tree.exists('.husky/prepare-commit-msg');
    expect(file).toBeTruthy();
  });

  it('creates .czrc', async () => {
    await generator(tree, {});
    const file = tree.exists('.czrc');
    expect(file).toBeTruthy();
  });

  it('creates .commitlintrc', async () => {
    await generator(tree, {});
    const file = tree.exists('.commitlintrc');
    expect(file).toBeTruthy();
  });

  it('.commitlintrc uses applications and libraries scopes by default', async () => {
    await generator(tree, {});
    const json = getJsonFile(tree, '.commitlintrc');
    expect(json['rules']['scope-enum'][2]).toEqual(['app1', 'lib1']);
  });

  it('.commitlintrc ignores applications scope if "appScopes" is false', async () => {
    await generator(tree, { appScopes: false });
    const json = getJsonFile(tree, '.commitlintrc');
    expect(json['rules']['scope-enum'][2]).toEqual(['lib1']);
  });

  it('.commitlintrc ignores libraries scope if "libScopes" is false', async () => {
    await generator(tree, { libScopes: false });
    const json = getJsonFile(tree, '.commitlintrc');
    expect(json['rules']['scope-enum'][2]).toEqual(['app1']);
  });

  it('.commitlintrc ignores applications and libraries scope if "appScopes" and "libScopes" are false', async () => {
    await generator(tree, { appScopes: false, libScopes: false });
    const json = getJsonFile(tree, '.commitlintrc');
    expect(json['rules']['scope-enum'][2]).toEqual([]);
  });

  it('.commitlintrc uses "scopes"', async () => {
    await generator(tree, {
      scopes: 'test1',
      appScopes: false,
      libScopes: false,
    });
    const json = getJsonFile(tree, '.commitlintrc');
    expect(json['rules']['scope-enum'][2]).toEqual(['test1']);
  });

  it('.commitlintrc uses "scopes" from comma-separated list', async () => {
    await generator(tree, {
      scopes: 'test1, test2',
      appScopes: false,
      libScopes: false,
    });
    const json = getJsonFile(tree, '.commitlintrc');
    expect(json['rules']['scope-enum'][2]).toEqual(['test1', 'test2']);
  });

  it('.commitlintrc removes spaces and emty values from scopes', async () => {
    await generator(tree, {
      scopes: ' test1 ,, ,',
      appScopes: true,
      libScopes: true,
    });
    const json = getJsonFile(tree, '.commitlintrc');
    expect(json['rules']['scope-enum'][2]).toEqual(['test1', 'app1', 'lib1']);
  });

  it('.commitlintrc joins all scope sources', async () => {
    await generator(tree, { scopes: 'test1' });
    const json = getJsonFile(tree, '.commitlintrc');
    expect(json['rules']['scope-enum'][2]).toEqual(['test1', 'app1', 'lib1']);
  });

  it('adds commitlint dependencies', async () => {
    await generator(tree, {});
    const devDeps = getPackageJsonDevDepsKeys(tree);
    expect(devDeps).toEqual(
      expect.arrayContaining([
        '@commitlint/cli',
        '@commitlint/config-conventional',
        '@commitlint/cz-commitlint',
        'inquirer',
      ])
    );
  });

  it('adds commitizen dependency', async () => {
    await generator(tree, {});
    const devDeps = getPackageJsonDevDepsKeys(tree);
    expect(devDeps).toEqual(expect.arrayContaining(['commitizen']));
  });

  it('adds husky dependency', async () => {
    await generator(tree, {});
    const devDeps = getPackageJsonDevDepsKeys(tree);
    expect(devDeps).toEqual(expect.arrayContaining(['husky']));
  });

  it('makes husky scripts executable', async () => {
    const spy = jest.spyOn(tree, 'changePermissions');
    expect(spy).not.toHaveBeenCalled();
    await generator(tree, {});
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, '.husky/commit-msg', '755');
    expect(spy).toHaveBeenNthCalledWith(2, '.husky/prepare-commit-msg', '755');
    spy.mockReset();
  });

  it('adds husky install to non existing scripts', async () => {
    await generator(tree, {});
    const packageJsonPost = getJsonFile(tree, 'package.json');
    expect(packageJsonPost['scripts']).toEqual({
      prepare: 'husky install',
    });
  });

  it('adds husky install to non existing "prepare" script', async () => {
    const packageJson = getJsonFile(tree, 'package.json');
    packageJson['scripts'] = { test: 'test' };
    tree.write('package.json', JSON.stringify(packageJson));
    await generator(tree, {});
    const packageJsonPost = getJsonFile(tree, 'package.json');
    expect(packageJsonPost['scripts']).toEqual({
      test: 'test',
      prepare: 'husky install',
    });
  });

  it('adds husky install to existing "prepare" script', async () => {
    const packageJson = getJsonFile(tree, 'package.json');
    packageJson['scripts'] = { test: 'test', prepare: 'ECHO TEST' };
    tree.write('package.json', JSON.stringify(packageJson));
    await generator(tree, {});
    const packageJsonPost = getJsonFile(tree, 'package.json');
    expect(packageJsonPost['scripts']).toEqual({
      test: 'test',
      prepare: 'ECHO TEST && husky install',
    });
  });

  it('format files if no "skipFormat"', async () => {
    const spy = jest.spyOn(devKit, 'formatFiles');
    expect(spy).not.toHaveBeenCalled();
    await generator(tree, {});
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it('format files if "skipFormat" false', async () => {
    const spy = jest.spyOn(devKit, 'formatFiles');
    expect(spy).not.toHaveBeenCalled();
    await generator(tree, { skipFormat: false });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it('dont format files if "skipFormat" true', async () => {
    const spy = jest.spyOn(devKit, 'formatFiles');
    expect(spy).not.toHaveBeenCalled();
    await generator(tree, { skipFormat: true });
    expect(spy).not.toHaveBeenCalled();
    spy.mockReset();
  });
});
