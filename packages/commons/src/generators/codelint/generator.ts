import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  Tree,
} from '@nrwl/devkit';
import { join } from 'path';

import { SHARED_HUSKY } from '../../shared';
import {
  addScriptToWorkspace,
  addVSCodeRecommendation,
  getJsonFile,
  getWorkspaceDevDependencies,
} from '../../utils';
import { CodelintGeneratorSchema } from './schema';

interface NormalizedSchema extends CodelintGeneratorSchema {
  workspaceRoot: string;
}

function normalizeOptions(
  tree: Tree,
  options: CodelintGeneratorSchema
): NormalizedSchema {
  const workspaceRoot = '/';

  return {
    skipFormat: false,
    workspaceRoot,
    ...options,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    template: '',
  };

  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.workspaceRoot,
    templateOptions
  );
}

function hasEslint(tree: Tree): boolean {
  return getWorkspaceDevDependencies(tree).includes('eslint');
}

function modifyEslintConfig(tree: Tree) {
  const lintJsonFile = '.eslintrc.json';
  const lintJson = getJsonFile(tree, lintJsonFile);
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
          argsIgnorePattern: '^_',
        },
      ],
    },
  };

  if (lintJson !== null && Array.isArray(lintJson.overrides)) {
    lintJson.overrides = [eslintConfig, ...lintJson.overrides];
    tree.write(lintJsonFile, JSON.stringify(lintJson));
  }
}

function addLintToLintStaged(tree: Tree) {
  const lintStagedFile = '.lintstagedrc';
  const lintStagedJson = getJsonFile(tree, lintStagedFile);

  if (lintStagedJson !== null) {
    lintStagedJson['*.{js,jsx,ts,tsx}'] = ['nx affected:lint --fix --files'];
    tree.write(lintStagedFile, JSON.stringify(lintStagedJson));
  }
}

function addDependencies(tree: Tree) {
  const eslintDependencies = {
    'eslint-plugin-import': '^2.27.5',
    'eslint-plugin-simple-import-sort': '^10.0.0',
    'eslint-plugin-unused-imports': '^2.0.0',
  };
  const devDependencies = {
    ...SHARED_HUSKY,
    prettier: '~2.8.5',
    'lint-staged': '~13.2.0',
    ...(hasEslint(tree) ? eslintDependencies : {}),
  };

  addDependenciesToPackageJson(tree, {}, devDependencies);
}

function prepareHusky(tree: Tree) {
  tree.changePermissions('.husky/pre-commit', '755');
  addScriptToWorkspace(tree, 'prepare', 'husky install');
}

function preparePrettier(tree: Tree) {
  // Add VSCode settings
  addVSCodeRecommendation(tree, 'esbenp.prettier-vscode');
  addScriptToWorkspace(tree, 'format:all', 'nx format:write --all');
}

function prepareEslint(tree: Tree) {
  modifyEslintConfig(tree);
  addLintToLintStaged(tree);
}

export default async function (tree: Tree, options: CodelintGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  addFiles(tree, normalizedOptions);
  addDependencies(tree);
  prepareHusky(tree);
  preparePrettier(tree);

  if (hasEslint(tree)) {
    prepareEslint(tree);
  }

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }

  return () => {
    installPackagesTask(tree);
  };
}
