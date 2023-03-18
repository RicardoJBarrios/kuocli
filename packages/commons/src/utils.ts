import { getProjects, ProjectType, Tree } from '@nrwl/devkit';

export function filterEmptyValues(array: string[]): string[] {
  return array.filter((s) => s.trim());
}

export function getProjectNamesByType(
  tree: Tree,
  projectType: ProjectType
): string[] {
  return [...getProjects(tree).values()]
    .filter((config) => projectType === config.projectType)
    .map((config) => config.name);
}

export function getJsonFile(tree: Tree, path: string): Record<string, unknown> {
  const buffer = tree.read(path);
  return JSON.parse(buffer.toString());
}

export function getPackageJsonDevDepsKeys(tree: Tree): string[] {
  const packageJson = getJsonFile(tree, 'package.json');
  return Object.keys(packageJson.devDependencies);
}

export function addScriptToPackageJson(
  tree: Tree,
  scriptName: string,
  script: string
) {
  const path = 'package.json';
  const packageJson = getJsonFile(tree, path);
  packageJson.scripts = {
    ...((packageJson?.scripts as object) ?? {}),
    [scriptName]: packageJson?.scripts?.[scriptName]
      ? `${packageJson.scripts[scriptName]} && ${script}`
      : script,
  };

  tree.write(path, JSON.stringify(packageJson));
}
