import { addDependenciesToPackageJson, formatFiles, generateFiles, installPackagesTask, Tree } from '@nrwl/devkit';
import { join } from 'path';

import { SHARED_HUSKY } from '../../shared';
import { addScriptToWorkspace } from '../../utils/add-script-to-workspace';
import { cleanStringArray } from '../../utils/clean-string-array';
import { getProjectNamesByType } from '../../utils/get-project-names-by-type';
import { GitlintGeneratorSchema } from './schema';

interface NormalizedSchema extends GitlintGeneratorSchema {
  workspaceRoot: string;
  parsedScopes: string[];
}

function normalizeOptions(tree: Tree, options: GitlintGeneratorSchema): NormalizedSchema {
  const finalOptions = {
    appScopes: true,
    libScopes: true,
    skipFormat: false,
    ...options
  };
  const workspaceRoot = '/';
  const parsedScopes = cleanStringArray([
    ...(finalOptions.scopes ? finalOptions.scopes.split(',') : []),
    ...(finalOptions.appScopes ? getProjectNamesByType(tree, 'application') : []),
    ...(finalOptions.libScopes ? getProjectNamesByType(tree, 'library') : [])
  ]);

  return {
    ...finalOptions,
    workspaceRoot,
    parsedScopes
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    template: ''
  };

  generateFiles(tree, join(__dirname, 'files'), options.workspaceRoot, templateOptions);
}

function addDependencies(tree: Tree) {
  const devDependencies = {
    ...SHARED_HUSKY,
    '@commitlint/cli': '~17.4.4',
    '@commitlint/config-conventional': '~17.4.4',
    '@commitlint/cz-commitlint': '~17.4.4',
    commitizen: '~4.3.0',
    inquirer: '~8.0.0'
  };

  addDependenciesToPackageJson(tree, {}, devDependencies);
}

function prepareHusky(tree: Tree) {
  tree.changePermissions('.husky/commit-msg', '755');
  tree.changePermissions('.husky/prepare-commit-msg', '755');
  addScriptToWorkspace(tree, 'prepare', 'husky install');
}

export default async function (tree: Tree, options: GitlintGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  addFiles(tree, normalizedOptions);
  addDependencies(tree);
  prepareHusky(tree);

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }

  return () => {
    installPackagesTask(tree);
  };
}
