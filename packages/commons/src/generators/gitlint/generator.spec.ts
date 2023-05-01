import { addProjectConfiguration, readJson, Tree } from '@nrwl/devkit';
import * as DevKit from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import * as ChildProcess from 'child_process';

import { getDependencies } from '../../utils';
import generator from './generator';

jest.mock('@nrwl/devkit', () => {
  const original = jest.requireActual('@nrwl/devkit');
  return {
    ...original,
    formatFiles: jest.fn()
  };
});

jest.mock('child_process', () => {
  const original = jest.requireActual('child_process');
  return {
    ...original,
    execSync: jest.fn()
  };
});

describe('gitlint generator', () => {
  let tree: Tree;
  let spyFormatFiles: jest.SpyInstance<Promise<void>>;
  let spyExecSync: jest.SpyInstance<string | Buffer>;
  let spyLoggerInfo: jest.SpyInstance<unknown>;
  let spyLoggerError: jest.SpyInstance<unknown>;

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

  beforeEach(() => {
    spyExecSync = jest.spyOn(ChildProcess, 'execSync').mockReturnValue('');
    spyLoggerInfo = jest.spyOn(DevKit.logger, 'info').mockImplementation(() => null);
    spyLoggerError = jest.spyOn(DevKit.logger, 'error').mockImplementation(() => null);
    spyFormatFiles = jest.spyOn(DevKit, 'formatFiles');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    spyExecSync.mockReset();
    spyLoggerInfo.mockReset();
    spyLoggerError.mockReset();
    spyFormatFiles.mockReset();
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

    it(`adds GitLens IDE settings`, async () => {
      const settings = {
        'gitlens.graph.statusBar.enabled': false,
        'gitlens.plusFeatures.enabled': false,
        'gitlens.showWelcomeOnInstall': false
      };
      await generator(tree, {});
      const json = readJson(tree, '.vscode/settings.json');
      expect(json).toEqual(expect.objectContaining(settings));
    });

    it('adds Git Graph plugin to IDE', async () => {
      await generator(tree, {});
      const json = readJson(tree, '.vscode/extensions.json');
      expect(json.recommendations).toEqual(expect.arrayContaining(['mhutchie.git-graph']));
    });
  });

  describe('prepareGitflow', () => {
    it(`do nothing if NX_DRY_RUN`, async () => {
      process.env.NX_DRY_RUN = 'true';
      spyExecSync.mockReturnValue('');

      expect(spyLoggerInfo).not.toHaveBeenCalled();
      await generator(tree, {});
      expect(spyLoggerInfo).not.toHaveBeenCalled();
      process.env.NX_DRY_RUN = '';
    });

    it(`logs error if no Gitflow installed`, async () => {
      spyExecSync.mockImplementationOnce(() => {
        throw new Error();
      });

      expect(() => generator(tree, {})).rejects.toBeTruthy();
    });

    it(`logs info if Gitflow is already initialized`, async () => {
      spyExecSync.mockReturnValueOnce('').mockReturnValueOnce('main').mockReturnValue('');

      expect(spyLoggerInfo).not.toHaveBeenCalled();
      await generator(tree, {});
      expect(spyLoggerInfo).toHaveBeenNthCalledWith(1, 'INFO Gitflow is already initialized');
    });

    it(`logs info if Gitflow initialized`, async () => {
      spyExecSync.mockReturnValue('');

      expect(spyLoggerInfo).not.toHaveBeenCalled();
      await generator(tree, {});
      expect(spyLoggerInfo).toHaveBeenNthCalledWith(1, 'INFO Gitflow initialized');
    });
  });

  describe('skipFormat', () => {
    it('format files if no "skipFormat"', async () => {
      expect(spyFormatFiles).not.toHaveBeenCalled();
      await generator(tree, {});
      expect(spyFormatFiles).toHaveBeenCalledTimes(1);
    });

    it('format files if "skipFormat" false', async () => {
      expect(spyFormatFiles).not.toHaveBeenCalled();
      await generator(tree, { skipFormat: false });
      expect(spyFormatFiles).toHaveBeenCalledTimes(1);
    });

    it('dont format files if "skipFormat" true', async () => {
      expect(spyFormatFiles).not.toHaveBeenCalled();
      await generator(tree, { skipFormat: true });
      expect(spyFormatFiles).not.toHaveBeenCalled();
    });
  });
});
