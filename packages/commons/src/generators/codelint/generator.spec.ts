import { addProjectConfiguration, readJson, Tree, updateJson, writeJson } from '@nrwl/devkit';
import * as DevKit from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import merge from 'lodash/merge';

import { getDependencies } from '../../utils';
import generator from './generator';

jest.mock('@nrwl/devkit', () => {
  const original = jest.requireActual('@nrwl/devkit');
  return {
    ...original,
    formatFiles: jest.fn(),
    detectPackageManager: jest.fn()
  };
});

function addEslintBasicConfig(tree: Tree) {
  writeJson(tree, '.eslintrc.json', { overrides: [] });
  updateJson(tree, 'package.json', (json) => {
    return merge(json, {
      devDependencies: { eslint: 'latest' }
    });
  });
}

describe('codelint generator', () => {
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

  describe('addFiles', () => {
    it('creates .husky/pre-commit', async () => {
      await generator(tree, {});
      const file = tree.exists('.husky/pre-commit');
      expect(file).toBeTruthy();
    });

    it('creates .lintstagedrc', async () => {
      await generator(tree, {});
      const file = tree.exists('.lintstagedrc');
      expect(file).toBeTruthy();
    });

    it('creates .prettierignore', async () => {
      await generator(tree, {});
      const file = tree.exists('.prettierignore');
      expect(file).toBeTruthy();
    });

    it('creates .prettierrc', async () => {
      await generator(tree, {});
      const file = tree.exists('.prettierrc');
      expect(file).toBeTruthy();
    });
  });

  describe('addDependencies', () => {
    it('adds prettier dependency', async () => {
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['prettier']));
    });

    it('adds lint-staged dependency', async () => {
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['lint-staged']));
    });

    it('adds husky dependency', async () => {
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['husky']));
    });

    it(`doesn't add eslint dependencies if no eslint`, async () => {
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).not.toEqual(expect.arrayContaining(['eslint-plugin-simple-import-sort']));
      expect(devDeps).not.toEqual(expect.arrayContaining(['eslint-plugin-unused-imports']));
    });

    it('adds eslint-plugin-simple-import-sort dependency if eslint', async () => {
      addEslintBasicConfig(tree);
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['eslint-plugin-simple-import-sort']));
    });

    it('adds eslint-plugin-unused-imports dependency if eslint', async () => {
      addEslintBasicConfig(tree);
      await generator(tree, {});
      const devDeps = getDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['eslint-plugin-unused-imports']));
    });
  });

  describe('preparePrettier', () => {
    it('adds prettier plugin to IDE', async () => {
      await generator(tree, {});
      const json = readJson(tree, '.vscode/extensions.json');
      expect(json.recommendations).toEqual(expect.arrayContaining(['esbenp.prettier-vscode']));
    });

    it('adds format:all script', async () => {
      await generator(tree, {});
      const json = readJson(tree, 'package.json');
      expect(json.scripts).toEqual(
        expect.objectContaining({
          'format:all': 'nx format:write --all'
        })
      );
    });

    it(`adds prettier IDE settings`, async () => {
      const settings = {
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
        'editor.formatOnSave': true,
        'editor.rulers': [120]
      };
      await generator(tree, {});
      const json = readJson(tree, '.vscode/settings.json');
      expect(json).toEqual(expect.objectContaining(settings));
    });
  });

  describe('prepareEslint', () => {
    beforeEach(() => {
      addEslintBasicConfig(tree);
    });

    it(`adds eslint plugin to IDE`, async () => {
      await generator(tree, {});
      const json = readJson(tree, '.vscode/extensions.json');
      expect(json?.recommendations).toEqual(expect.arrayContaining(['dbaeumer.vscode-eslint']));
    });

    it('adds lint:all script', async () => {
      await generator(tree, {});
      const json = readJson(tree, 'package.json');
      expect(json.scripts).toEqual(
        expect.objectContaining({
          'lint:all': 'nx run-many --all --target=lint --fix'
        })
      );
    });

    it('modifies .eslintrc.json', async () => {
      const eslintConfig = {
        files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
        plugins: ['simple-import-sort', 'unused-imports'],
        rules: {
          'no-unused-vars': 'off',
          '@typescript-eslint/no-unused-vars': 'off',
          'simple-import-sort/imports': 'error',
          'simple-import-sort/exports': 'error',
          'unused-imports/no-unused-imports': 'error',
          'unused-imports/no-unused-vars': 'warn'
        }
      };
      await generator(tree, {});
      const json = readJson(tree, '.eslintrc.json');
      expect(json?.overrides).toEqual(expect.arrayContaining([eslintConfig]));
    });

    it('adds eslint to lint-staged', async () => {
      await generator(tree, {});
      const json = readJson(tree, '.lintstagedrc');
      expect(json?.['*.{js,jsx,ts,tsx}']).toEqual(expect.arrayContaining(['nx affected:lint --fix --files']));
    });

    it(`adds eslint IDE settings`, async () => {
      const settings = {
        'editor.codeActionsOnSave': {
          'source.fixAll.eslint': true
        }
      };
      await generator(tree, {});
      const json = readJson(tree, '.vscode/settings.json');
      expect(json).toEqual(expect.objectContaining(settings));
    });
  });

  describe('prepareCodemetrics', () => {
    it(`adds codemetrics plugin to IDE`, async () => {
      await generator(tree, {});
      const json = readJson(tree, '.vscode/extensions.json');
      expect(json?.recommendations).toEqual(expect.arrayContaining(['kisstkondoros.vscode-codemetrics']));
    });

    it(`adds codemetrics IDE settings`, async () => {
      const settings = {
        'codemetrics.basics.ComplexityLevelExtreme': 25,
        'codemetrics.basics.ComplexityLevelExtremeDescription': 'Extreme',
        'codemetrics.basics.ComplexityLevelHigh': 10,
        'codemetrics.basics.ComplexityLevelHighDescription': 'High',
        'codemetrics.basics.ComplexityLevelNormal': 5,
        'codemetrics.basics.ComplexityLevelNormalDescription': 'Normal',
        'codemetrics.basics.ComplexityLevelLow': 0,
        'codemetrics.basics.ComplexityLevelLowDescription': 'Low',
        'codemetrics.basics.ComplexityTemplate': '{1} complexity: {0}',
        'codemetrics.basics.DecorationModeEnabled': false,
        'codemetrics.basics.Exclude': ['**/*.spec.ts']
      };
      await generator(tree, {});
      const json = readJson(tree, '.vscode/settings.json');
      expect(json).toEqual(expect.objectContaining(settings));
    });
  });

  describe('prepareSonarlint', () => {
    it(`adds sonarlint plugin to IDE`, async () => {
      await generator(tree, {});
      const json = readJson(tree, '.vscode/extensions.json');
      expect(json?.recommendations).toEqual(expect.arrayContaining(['SonarSource.sonarlint-vscode']));
    });

    it(`adds sonarlint IDE settings`, async () => {
      const settings = {
        'sonarlint.analyzerProperties': {
          'sonar.typescript.exclusions': '**/*.spec.ts,**/test-setup.ts'
        }
      };
      await generator(tree, {});
      const json = readJson(tree, '.vscode/settings.json');
      expect(json).toEqual(expect.objectContaining(settings));
    });
  });

  describe('prepareEditorconfig', () => {
    it(`removes .editorconfig file`, async () => {
      tree.write('.editorconfig', JSON.stringify({}));
      await generator(tree, {});
      expect(tree.exists('.editorconfig')).toEqual(false);
    });
  });

  describe('prepareHusky', () => {
    it('makes husky scripts executable', async () => {
      const spy = jest.spyOn(tree, 'changePermissions');
      expect(spy).not.toHaveBeenCalled();
      await generator(tree, {});
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenNthCalledWith(1, '.husky/pre-commit', '755');
      spy.mockReset();
    });

    it('adds husky install script', async () => {
      await generator(tree, {});
      const packageJsonPost = readJson(tree, 'package.json');
      expect(packageJsonPost.scripts).toEqual(
        expect.objectContaining({
          prepare: 'husky install'
        })
      );
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
