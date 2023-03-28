import { addProjectConfiguration, Tree } from '@nrwl/devkit';
import * as devKit from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getJsonFile } from '../../utils/get-json-file';
import { getWorkspaceDependencies } from '../../utils/get-workspace-dependencies';
import { upsertJsonFile } from '../../utils/upsert-json-file';
import generator from './generator';

const eslintConfig = {
  files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  plugins: ['simple-import-sort', 'import', 'unused-imports'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ]
  }
};

function addEslintDevDependency(tree: Tree) {
  upsertJsonFile(tree, 'package.json', (json) => {
    json.devDependencies = {
      ...((json.devDependencies ?? []) as []),
      eslint: 'latest'
    };

    return json;
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
      const devDeps = getWorkspaceDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['prettier']));
    });

    it('adds lint-staged dependency', async () => {
      await generator(tree, {});
      const devDeps = getWorkspaceDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['lint-staged']));
    });

    it('adds husky dependency', async () => {
      await generator(tree, {});
      const devDeps = getWorkspaceDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['husky']));
    });

    it(`doesn't add eslint dependencies`, async () => {
      await generator(tree, {});
      const devDeps = getWorkspaceDependencies(tree, 'devDependencies');
      expect(devDeps).not.toEqual(expect.arrayContaining(['eslint-plugin-import']));
    });

    it('adds eslint-plugin-import dependency', async () => {
      addEslintDevDependency(tree);
      await generator(tree, {});
      const devDeps = getWorkspaceDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['eslint-plugin-import']));
    });

    it('adds eslint-plugin-simple-import-sort dependency', async () => {
      addEslintDevDependency(tree);
      await generator(tree, {});
      const devDeps = getWorkspaceDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['eslint-plugin-simple-import-sort']));
    });

    it('adds eslint-plugin-unused-imports dependency', async () => {
      addEslintDevDependency(tree);
      await generator(tree, {});
      const devDeps = getWorkspaceDependencies(tree, 'devDependencies');
      expect(devDeps).toEqual(expect.arrayContaining(['eslint-plugin-unused-imports']));
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
      const packageJsonPost = getJsonFile(tree, 'package.json');
      expect(packageJsonPost.scripts).toEqual(
        expect.objectContaining({
          prepare: 'husky install'
        })
      );
    });
  });

  describe('preparePrettier', () => {
    it('adds VS Code Extensions', async () => {
      await generator(tree, {});
      const json = getJsonFile(tree, '.vscode/extensions.json');
      expect(json.recommendations).toEqual(expect.arrayContaining(['esbenp.prettier-vscode']));
    });

    it('adds format:all script', async () => {
      await generator(tree, {});
      const packageJsonPost = getJsonFile(tree, 'package.json');
      expect(packageJsonPost.scripts).toEqual(
        expect.objectContaining({
          'format:all': 'nx format:write --all'
        })
      );
    });
  });

  describe('prepareEslint', () => {
    it('modifies .eslintrc.json', async () => {
      const filePath = '.eslintrc.json';
      upsertJsonFile(tree, filePath, () => ({ overrides: [] }));
      addEslintDevDependency(tree);
      await generator(tree, {});
      const json = getJsonFile(tree, filePath);
      expect(json.overrides).toEqual(expect.arrayContaining([eslintConfig]));
    });

    it('add lint to lint-staged', async () => {
      const filePath = '.lintstagedrc';
      addEslintDevDependency(tree);
      await generator(tree, {});
      const json = getJsonFile(tree, filePath);
      expect(json['*.{js,jsx,ts,tsx}']).toEqual(expect.arrayContaining(['nx affected:lint --fix --files']));
    });
  });

  describe('skipFormat', () => {
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
});
