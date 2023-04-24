import { addDependenciesToPackageJson, formatFiles, generateFiles, installPackagesTask, Tree } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { join } from 'path';

import { SHARED_HUSKY } from '../../shared';
import { addScript, cleanArray, getProjectNamesByType, upsertHuskyHook } from '../../utils';
import { GitlintGeneratorSchema } from './schema';

interface NormalizedSchema extends GitlintGeneratorSchema {
  workspaceRoot: string;
  parsedScopes: string[];
  tmpl: string;
}

function normalizeOptions(tree: Tree, options: GitlintGeneratorSchema): NormalizedSchema {
  const finalOptions = {
    gitflow: true,
    appScopes: true,
    libScopes: true,
    skipFormat: false,
    ...options
  };
  const workspaceRoot = '/';
  const parsedScopes = cleanArray([
    ...(finalOptions.scopes ? finalOptions.scopes.split(',') : []),
    ...(finalOptions.appScopes ? getProjectNamesByType(tree, 'application') : []),
    ...(finalOptions.libScopes ? getProjectNamesByType(tree, 'library') : [])
  ]);

  return {
    ...finalOptions,
    workspaceRoot,
    parsedScopes,
    tmpl: ''
  };
}

function prepareCommitlint(tree: Tree, options: NormalizedSchema) {
  const devDependencies = {
    '@commitlint/cli': '~17.6.1',
    '@commitlint/config-conventional': '~17.6.1',
    '@commitlint/cz-commitlint': '~17.5.0',
    inquirer: '8.2.5' // @commitlint/config-conventional peer dependency
  };
  addDependenciesToPackageJson(tree, {}, devDependencies);
  upsertHuskyHook(tree, 'commit-msg', 'npx --no-install commitlint --edit $1');
  generateFiles(tree, join(__dirname, 'files/commitlint'), options.workspaceRoot, options);
}

function prepareCommitizen(tree: Tree, options: NormalizedSchema) {
  const devDependencies = {
    commitizen: '~4.3.0'
  };
  addDependenciesToPackageJson(tree, {}, devDependencies);
  const huskyHookScripts = [
    'COMMIT_MSG_FILE=$1\nCOMMIT_SOURCE=$2\nSHA1=$3\n',
    'if [ "${COMMIT_SOURCE}" = merge ]; then exit 0; fi\n',
    'exec < /dev/tty && npx --no-install cz --hook || true'
  ];
  upsertHuskyHook(tree, 'prepare-commit-msg', ...huskyHookScripts);
  generateFiles(tree, join(__dirname, 'files/commitizen'), options.workspaceRoot, options);
}

function prepareHusky(tree: Tree) {
  addDependenciesToPackageJson(tree, {}, SHARED_HUSKY);
  addScript(tree, 'prepare', 'husky install');
}

function prepareGitflow(options: NormalizedSchema) {
  if (options.gitflow) {
    execSync('git flow init -d');
    // execSync('git config "gitflow.path.hooks" .husky');
  }
}

export default async function (tree: Tree, options: GitlintGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  prepareCommitlint(tree, normalizedOptions);
  prepareCommitizen(tree, normalizedOptions);
  prepareHusky(tree);
  prepareGitflow(normalizedOptions);

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }

  return () => {
    installPackagesTask(tree);
  };
}
