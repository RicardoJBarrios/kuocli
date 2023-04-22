import {
  addDependenciesToPackageJson,
  detectPackageManager,
  formatFiles,
  generateFiles,
  installPackagesTask,
  PackageManager,
  Tree,
  updateJson
} from '@nrwl/devkit';
import { join } from 'path';

import { SHARED_HUSKY } from '../../shared';
import {
  addScript,
  getDependencies,
  mergeWithArray,
  upsertIDEExtensionRecommendations,
  upsertIDESettings
} from '../../utils';
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
  return getDependencies(tree, 'devDependencies').includes('eslint');
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

  updateJson(tree, '.eslintrc.json', (json) => {
    return mergeWithArray(json, eslintConfig);
  });
}

function addEslintToLintStaged(tree: Tree) {
  const lintAffected = { '*.{js,jsx,ts,tsx}': ['nx affected:lint --fix --files'] };

  updateJson(tree, '.lintstagedrc', (json) => {
    return mergeWithArray(json, lintAffected);
  });
}

function addDependencies(tree: Tree) {
  const devDependencies = {
    ...SHARED_HUSKY,
    'lint-staged': '~13.2.0'
  };
  addDependenciesToPackageJson(tree, {}, devDependencies);
}

function preparePrettier(tree: Tree) {
  addDependenciesToPackageJson(tree, {}, { prettier: '~2.8.5' });
  upsertIDEExtensionRecommendations(tree, 'esbenp.prettier-vscode');
  addScript(tree, 'format:all', 'nx format:write --all');
  upsertIDESettings(tree, {
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'editor.formatOnSave': true,
    'editor.rulers': [120]
  });
}

function prepareEslint(tree: Tree) {
  if (hasEslint(tree)) {
    const devDependencies = {
      'eslint-plugin-simple-import-sort': '^10.0.0',
      'eslint-plugin-unused-imports': '^2.0.0'
    };
    addDependenciesToPackageJson(tree, {}, devDependencies);
    upsertIDEExtensionRecommendations(tree, 'dbaeumer.vscode-eslint');
    addScript(tree, 'lint:all', 'nx run-many --all --target=lint --fix');
    modifyEslintConfig(tree);
    addEslintToLintStaged(tree);
    upsertIDESettings(tree, {
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true
      }
    });
  }
}

function prepareCodemetrics(tree: Tree) {
  upsertIDEExtensionRecommendations(tree, 'kisstkondoros.vscode-codemetrics');
  upsertIDESettings(tree, {
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
  upsertIDEExtensionRecommendations(tree, 'SonarSource.sonarlint-vscode');
  upsertIDESettings(tree, {
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
  addScript(tree, 'prepare', 'husky install');
}

function prepareSecurityCheck(tree: Tree) {
  const packageManager: PackageManager = detectPackageManager();
  const scripts = {
    yarn: 'yarn-audit-fix --only=prod',
    pnpm: 'pnpm audit --fix --prod',
    npm: 'npm audit fix --omit=dev --omit=peer'
  };

  addScript(tree, 'audit:prod', scripts[packageManager]);
  addScript(tree, 'ci:pre-commit:main', `git-branch-is main -q && ${scripts[packageManager]}`);
  if (packageManager === 'yarn') {
    addDependenciesToPackageJson(tree, {}, { 'yarn-audit-fix': '~9.3.10' });
  }
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
