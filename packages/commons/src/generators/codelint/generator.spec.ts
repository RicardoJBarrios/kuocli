import { addProjectConfiguration, Tree } from '@nrwl/devkit';
import * as devKit from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getJsonFile, getWorkspaceDevDependencies } from '../../utils';
import generator from './generator';

describe('Codelint generator', () => {
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
      const devDeps = getWorkspaceDevDependencies(tree);
      expect(devDeps).toEqual(expect.arrayContaining(['prettier']));
    });

    it('adds lint-staged dependency', async () => {
      await generator(tree, {});
      const devDeps = getWorkspaceDevDependencies(tree);
      expect(devDeps).toEqual(expect.arrayContaining(['lint-staged']));
    });

    it('adds husky dependency', async () => {
      await generator(tree, {});
      const devDeps = getWorkspaceDevDependencies(tree);
      expect(devDeps).toEqual(expect.arrayContaining(['husky']));
    });

    it(`doesn't add eslint dependencies`, async () => {
      await generator(tree, {});
      const devDeps = getWorkspaceDevDependencies(tree);
      expect(devDeps).not.toEqual(
        expect.arrayContaining(['eslint-plugin-import'])
      );
    });

    it('adds eslint-plugin-import dependency', async () => {
      const json = getJsonFile(tree, 'package.json');
      json.devDependencies = { eslint: '' };
      tree.write('package.json', JSON.stringify(json));
      await generator(tree, {});
      const devDeps = getWorkspaceDevDependencies(tree);
      expect(devDeps).toEqual(expect.arrayContaining(['eslint-plugin-import']));
    });

    it('adds eslint-plugin-simple-import-sort dependency', async () => {
      const json = getJsonFile(tree, 'package.json');
      json.devDependencies = { eslint: '' };
      tree.write('package.json', JSON.stringify(json));
      await generator(tree, {});
      const devDeps = getWorkspaceDevDependencies(tree);
      expect(devDeps).toEqual(
        expect.arrayContaining(['eslint-plugin-simple-import-sort'])
      );
    });

    it('adds eslint-plugin-unused-imports dependency', async () => {
      const json = getJsonFile(tree, 'package.json');
      json.devDependencies = { eslint: '' };
      tree.write('package.json', JSON.stringify(json));
      await generator(tree, {});
      const devDeps = getWorkspaceDevDependencies(tree);
      expect(devDeps).toEqual(
        expect.arrayContaining(['eslint-plugin-unused-imports'])
      );
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
          prepare: 'husky install',
        })
      );
    });
  });

  describe('preparePrettier', () => {
    it('adds VS Code Extensions', async () => {
      await generator(tree, {});
      const json = getJsonFile(tree, '.vscode/extensions.json');
      expect(json.recommendations).toEqual(
        expect.arrayContaining(['esbenp.prettier-vscode'])
      );
    });

    it('adds format:all script', async () => {
      await generator(tree, {});
      const packageJsonPost = getJsonFile(tree, 'package.json');
      expect(packageJsonPost.scripts).toEqual(
        expect.objectContaining({
          'format:all': 'nx format:write --all',
        })
      );
    });
  });

  describe('prepareEslint', () => {
    // it('add...', async () => {
    //   await generator(tree, {});
    //   const json = getJsonFile(tree, '.vscode/extensions.json');
    //   expect(json.recommendations).toEqual(
    //     expect.arrayContaining(['esbenp.prettier-vscode'])
    //   );
    // });
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
