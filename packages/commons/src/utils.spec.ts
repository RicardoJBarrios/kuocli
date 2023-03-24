import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addScriptToWorkspace, getJsonFile } from './utils';

describe('Utils', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  describe('addScriptToWorkspace', () => {
    const scripts = (tree: Tree) => {
      return getJsonFile(tree, 'package.json')?.scripts;
    };

    it(`adds script if package.scripts doesn't exist`, () => {
      addScriptToWorkspace(tree, 'a', 'a');
      expect(scripts(tree)).toEqual({ a: 'a' });
    });

    it(`adds script if package.scripts.name doesn't exist`, () => {
      addScriptToWorkspace(tree, 'a', 'a');
      addScriptToWorkspace(tree, 'b', 'b');
      expect(scripts(tree)).toEqual({ a: 'a', b: 'b' });
    });

    it(`adds script if package.scripts.name exists`, () => {
      addScriptToWorkspace(tree, 'a', 'a');
      addScriptToWorkspace(tree, 'a', 'b');
      expect(scripts(tree)).toEqual({ a: 'a && b' });
    });

    it(`doesn't add script if package.scripts.name exists and is duplicated`, () => {
      addScriptToWorkspace(tree, 'a', 'a');
      addScriptToWorkspace(tree, 'a', 'a');
      expect(scripts(tree)).toEqual({ a: 'a' });
    });
  });
});
