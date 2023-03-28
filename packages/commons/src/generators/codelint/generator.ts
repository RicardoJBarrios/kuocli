import { addDependenciesToPackageJson, formatFiles, generateFiles, installPackagesTask, Tree } from '@nrwl/devkit';
import { join } from 'path';

import { SHARED_HUSKY } from '../../shared';
import { addIdePluginRecommendations } from '../../utils/add-ide-plugin-recommendations';
import { addIdeSettings } from '../../utils/add-ide-settings';
import { addScriptToWorkspace } from '../../utils/add-script-to-workspace';
import { getJsonFile } from '../../utils/get-json-file';
import { getWorkspaceDependencies } from '../../utils/get-workspace-dependencies';
import { upsertJsonFile } from '../../utils/upsert-json-file';
import { CodelintGeneratorSchema } from './schema';

interface NormalizedSchema extends CodelintGeneratorSchema {
  workspaceRoot: string;
}

function normalizeOptions(options: CodelintGeneratorSchema): NormalizedSchema {
  const workspaceRoot = '/';

  return {
    skipFormat: false,
    workspaceRoot,
    ...options
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    template: ''
  };

  generateFiles(tree, join(__dirname, 'files'), options.workspaceRoot, templateOptions);
}

function hasEslint(tree: Tree): boolean {
  return getWorkspaceDependencies(tree, 'devDependencies').includes('eslint');
}

function modifyEslintConfig(tree: Tree) {
  const filePath = '.eslintrc.json';
  const lintJson = getJsonFile(tree, filePath);
  const eslintConfig = {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    plugins: ['import'],
    rules: {
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin', 'object', 'type']
        }
      ]
    }
  };

  if (lintJson !== null && Array.isArray(lintJson.overrides)) {
    upsertJsonFile(tree, filePath, (json) => {
      json.overrides = [...((json.overrides ?? []) as []), eslintConfig];

      return json;
    });
  }
}

function addLintToLintStaged(tree: Tree) {
  const filePath = '.lintstagedrc';
  upsertJsonFile(tree, filePath, (json) => {
    const value: unknown = json['*.{js,jsx,ts,tsx}'];
    const safeValue: string[] = Array.isArray(value) ? value : [];
    json['*.{js,jsx,ts,tsx}'] = [...safeValue, 'nx affected:lint --fix --files'];

    return json;
  });
}

function addDependencies(tree: Tree) {
  const eslintDependencies = {
    'eslint-plugin-import': '^2.27.5'
  };
  const devDependencies = {
    ...SHARED_HUSKY,
    prettier: '~2.8.5',
    'lint-staged': '~13.2.0',
    ...(hasEslint(tree) ? eslintDependencies : {})
  };

  addDependenciesToPackageJson(tree, {}, devDependencies);
}

function preparePrettier(tree: Tree) {
  addIdePluginRecommendations(tree, 'esbenp.prettier-vscode');
  addScriptToWorkspace(tree, 'format:all', 'nx format:write --all');
  addIdeSettings(tree, {
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'editor.formatOnSave': true,
    'editor.rulers': [120]
  });
}

function prepareEslint(tree: Tree) {
  addIdePluginRecommendations(tree, 'dbaeumer.vscode-eslint');
  addScriptToWorkspace(tree, 'lint:all', 'nx run-many --all --target=lint --fix');
  modifyEslintConfig(tree);
  addLintToLintStaged(tree);
  addIdeSettings(tree, {
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': true
    }
  });
}

function prepareCodemetrics(tree: Tree) {
  addIdePluginRecommendations(tree, 'kisstkondoros.vscode-codemetrics');
  addIdeSettings(tree, {
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
  });
}

function prepareHusky(tree: Tree) {
  tree.changePermissions('.husky/pre-commit', '755');
  addScriptToWorkspace(tree, 'prepare', 'husky install');
}

export default async function (tree: Tree, options: CodelintGeneratorSchema) {
  const normalizedOptions = normalizeOptions(options);

  addFiles(tree, normalizedOptions);
  addDependencies(tree);

  preparePrettier(tree);
  if (hasEslint(tree)) {
    prepareEslint(tree);
  }
  prepareCodemetrics(tree);

  prepareHusky(tree);

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }

  return () => {
    installPackagesTask(tree);
  };
}
