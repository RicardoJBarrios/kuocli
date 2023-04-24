import { addProjectConfiguration, readJson, Tree } from '@nrwl/devkit';
import * as DevKit from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getDependencies } from '../../utils';
import generator from './generator';

jest.mock('@nrwl/devkit', () => {
  const original = jest.requireActual('@nrwl/devkit');
  return {
    ...original,
    formatFiles: jest.fn()
  };
});

describe('gitlint generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    addProjectConfiguration(tree, 'app1', {
      projectType: 'application',
      root: 'apps/app1'
    });
    addProjectConfiguration(tree, 'lib1', {
      projectType: 'library',
      root: 'libs/lib1'
    });
  });

  describe('prepareCommitlint', () => {
    it('adds commitlint dependencies', async () => {
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(
        expect.arrayContaining([
          '@commitlint/cli',
          '@commitlint/config-conventional',
          '@commitlint/cz-commitlint',
          'inquirer'
        ])
      );
    });

    it('creates .husky/commit-msg', async () => {
      await generator(tree, {});
      const file = tree.exists('.husky/commit-msg');
      expect(file).toBeTruthy();
    });

    it('creates .commitlintrc', async () => {
      await generator(tree, {});
      const file = tree.exists('.commitlintrc');
      expect(file).toBeTruthy();
    });

    it('.commitlintrc uses applications and libraries scopes by default', async () => {
      await generator(tree, {});
      const json = readJson(tree, '.commitlintrc');
      expect(json['rules']['scope-enum'][2]).toEqual(['app1', 'lib1']);
    });

    it('.commitlintrc ignores applications scope if "appScopes" is false', async () => {
      await generator(tree, { appScopes: false });
      const json = readJson(tree, '.commitlintrc');
      expect(json['rules']['scope-enum'][2]).toEqual(['lib1']);
    });

    it('.commitlintrc ignores libraries scope if "libScopes" is false', async () => {
      await generator(tree, { libScopes: false });
      const json = readJson(tree, '.commitlintrc');
      expect(json['rules']['scope-enum'][2]).toEqual(['app1']);
    });

    it('.commitlintrc ignores applications and libraries scope if "appScopes" and "libScopes" are false', async () => {
      await generator(tree, { appScopes: false, libScopes: false });
      const json = readJson(tree, '.commitlintrc');
      expect(json['rules']['scope-enum'][2]).toEqual([]);
    });

    it('.commitlintrc uses "scopes"', async () => {
      await generator(tree, {
        scopes: 'test1',
        appScopes: false,
        libScopes: false
      });
      const json = readJson(tree, '.commitlintrc');
      expect(json['rules']['scope-enum'][2]).toEqual(['test1']);
    });

    it('.commitlintrc uses "scopes" from comma-separated list', async () => {
      await generator(tree, {
        scopes: 'test1, test2',
        appScopes: false,
        libScopes: false
      });
      const json = readJson(tree, '.commitlintrc');
      expect(json['rules']['scope-enum'][2]).toEqual(['test1', 'test2']);
    });

    it('.commitlintrc removes spaces and emty values from scopes', async () => {
      await generator(tree, {
        scopes: ' test1 ,, ,',
        appScopes: true,
        libScopes: true
      });
      const json = readJson(tree, '.commitlintrc');
      expect(json['rules']['scope-enum'][2]).toEqual(['test1', 'app1', 'lib1']);
    });

    it('.commitlintrc joins all scope sources', async () => {
      await generator(tree, { scopes: 'test1' });
      const json = readJson(tree, '.commitlintrc');
      expect(json['rules']['scope-enum'][2]).toEqual(['test1', 'app1', 'lib1']);
    });
  });

  describe('prepareCommitizen', () => {
    it('adds commitizen dependency', async () => {
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['commitizen']));
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
  });

  describe('prepareHusky', () => {
    it('adds husky dependency', async () => {
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['husky']));
    });

    it('adds git-branch-is dependency', async () => {
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['git-branch-is']));
    });

    it('adds husky install script', async () => {
      await generator(tree, {});
      const packageJsonPost = readJson(tree, 'package.json');
      expect(packageJsonPost.scripts).toEqual({
        prepare: 'husky install'
      });
    });
  });

  describe('prepareGit', () => {
    it('adds GitLens plugin to IDE', async () => {
      await generator(tree, {});
      const json = readJson(tree, '.vscode/extensions.json');
      expect(json.recommendations).toEqual(expect.arrayContaining(['eamodio.gitlens']));
    });

    it('adds Git Graph plugin to IDE', async () => {
      await generator(tree, {});
      const json = readJson(tree, '.vscode/extensions.json');
      expect(json.recommendations).toEqual(expect.arrayContaining(['mhutchie.git-graph']));
    });
  });

  describe('skipFormat', () => {
    let spy: jest.SpyInstance<Promise<void>, [tree: Tree]>;

    beforeAll(() => {
      jest.resetAllMocks();
    });

    beforeEach(() => {
      spy = jest.spyOn(DevKit, 'formatFiles');
    });

    afterEach(() => {
      jest.resetAllMocks();
      spy.mockReset();
    });

    it('format files if no "skipFormat"', async () => {
      expect(spy).not.toHaveBeenCalled();
      await generator(tree, {});
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('format files if "skipFormat" false', async () => {
      expect(spy).not.toHaveBeenCalled();
      await generator(tree, { skipFormat: false });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('dont format files if "skipFormat" true', async () => {
      expect(spy).not.toHaveBeenCalled();
      await generator(tree, { skipFormat: true });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
