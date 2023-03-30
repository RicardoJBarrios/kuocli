import {
  addDependenciesToPackageJson,
  detectPackageManager,
  formatFiles,
  generateFiles,
  installPackagesTask,
  PackageManager,
  Tree
} from '@nrwl/devkit';
import { join } from 'path';

import { SHARED_HUSKY } from '../../shared';
import { mergeWithArray } from '../../utils';
import { addIdePluginRecommendations } from '../../utils/add-ide-plugin-recommendations';
import { addIdeSettings } from '../../utils/add-ide-settings';
import { addScriptToWorkspace } from '../../utils/add-script-to-workspace';
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
  const eslintConfig = {
    overrides: [
      {
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
      }
    ]
  };

  upsertJsonFile(tree, '.eslintrc.json', (json) => {
    return mergeWithArray(json, eslintConfig);
  });
}

function addEslintToLintStaged(tree: Tree) {
  const lintAffected = { '*.{js,jsx,ts,tsx}': ['nx affected:lint --fix --files'] };

  upsertJsonFile(tree, '.lintstagedrc', (json) => {
    return mergeWithArray(json, lintAffected);
  });
}

function addDependencies(tree: Tree) {
  const eslintDependencies = {
    'eslint-plugin-simple-import-sort': '^10.0.0',
    'eslint-plugin-unused-imports': '^2.0.0'
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
  if (hasEslint(tree)) {
    addIdePluginRecommendations(tree, 'dbaeumer.vscode-eslint');
    addScriptToWorkspace(tree, 'lint:all', 'nx run-many --all --target=lint --fix');
    modifyEslintConfig(tree);
    addEslintToLintStaged(tree);
    addIdeSettings(tree, {
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true
      }
    });
  }
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

function prepareSonarlint(tree: Tree) {
  addIdePluginRecommendations(tree, 'SonarSource.sonarlint-vscode');
  addIdeSettings(tree, {
    'sonarlint.analyzerProperties': {
      'sonar.typescript.exclusions': '**/*.spec.ts,**/test-setup.ts'
    }
  });
}

function prepareEditorconfig(tree: Tree) {
  tree.delete('.editorconfig');
}

function prepareHusky(tree: Tree) {
  tree.changePermissions('.husky/pre-commit', '755');
  addScriptToWorkspace(tree, 'prepare', 'husky install');
}

function prepareSecurityCheck(tree: Tree) {
  const manager: PackageManager = detectPackageManager();
}

export default async function (tree: Tree, options: CodelintGeneratorSchema) {
  const normalizedOptions = normalizeOptions(options);

  addFiles(tree, normalizedOptions);
  addDependencies(tree);

  preparePrettier(tree);
  prepareEslint(tree);
  prepareCodemetrics(tree);
  prepareSonarlint(tree);
  prepareEditorconfig(tree);
  prepareSecurityCheck(tree);
  prepareHusky(tree);

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }

  return () => {
    installPackagesTask(tree);
  };
}
