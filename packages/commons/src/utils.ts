import { getProjects, ProjectType, Tree } from '@nrwl/devkit';

/**
 * Filters empty string values from an Array.
 * @param array The array to filter.
 * @returns The array without empty string values.
 */
export function filterEmptyStringValues(array: string[]): string[] {
  return array.filter((s) => s.trim());
}

/**
 * Gets the list of workspace project names by type.
 * @param tree The current generator tree.
 * @param projectType The type of project.
 * @returns The list of workspace project names by type.
 */
export function getProjectNamesByType(
  tree: Tree,
  projectType: ProjectType
): string[] {
  return [...getProjects(tree).values()]
    .filter((config) => projectType === config.projectType)
    .map((config) => config.name);
}

/**
 * Gets a parsed JSON File.
 * @param tree The current generator tree.
 * @param path The path of the file to read.
 * @returns The parsed JSON file or null if doesn't exists.
 */
export function getJsonFile(
  tree: Tree,
  path: string
): Record<string, unknown> | null {
  const jsonString = tree.read(path, 'utf8');
  return jsonString ? JSON.parse(jsonString) : null;
}

/**
 * Gets the dependencies from the workspace package.json.
 * @param tree The current generator tree.
 * @returns The devDependencies from the workspace package.json.
 */
export function getWorkspaceDependencies(tree: Tree): string[] {
  const packageJson = getJsonFile(tree, 'package.json');
  return Object.keys(packageJson.dependencies);
}

/**
 * Gets the devDependencies from the workspace package.json.
 * @param tree The current generator tree.
 * @returns The devDependencies from the workspace package.json.
 */
export function getWorkspaceDevDependencies(tree: Tree): string[] {
  const packageJson = getJsonFile(tree, 'package.json');
  return Object.keys(packageJson.devDependencies);
}

/**
 * Adds a script to the workspace package.json.
 * If the script name exists adds the code to be executed after the current code.
 * @param tree The current generator tree.
 * @param scriptName The name of the scrit to add.
 * @param script The code of the script to add.
 */
export function addScriptToWorkspace(
  tree: Tree,
  scriptName: string,
  script: string
) {
  const path = 'package.json';
  const packageJson = getJsonFile(tree, path);
  const scripts = packageJson?.scripts as Record<string, string> | undefined;
  let scriptCode: string | undefined = packageJson?.scripts?.[scriptName];
  if (scriptCode !== undefined) {
    scriptCode = scriptCode.includes(script)
      ? scriptCode
      : `${scriptCode} && ${script}`;
  } else {
    scriptCode = script;
  }
  packageJson.scripts = {
    ...(scripts ?? {}),
    [scriptName]: scriptCode,
  };

  tree.write(path, JSON.stringify(packageJson));
}

/**
 * Gets the dependency version installed in the workspace.
 * @param tree The current generator tree.
 * @returns The NX version installed in the workspace or null if there is no installed.
 */
export function getInstalledVersion(
  tree: Tree,
  depName: string
): string | null {
  const path = 'package.json';
  const packageJson = getJsonFile(tree, path);
  const version =
    packageJson.dependencies[depName] ?? packageJson.devDependencies[depName];

  return version ?? null;
}

export function addVSCodeRecommendation(tree: Tree, extension: string) {
  const filePath = '.vscode/extensions.json';
  const extensions = getJsonFile(tree, filePath) ?? {};
  const recommendations: string[] = extensions.recommendations
    ? (extensions.recommendations as string[])
    : [];

  if (!recommendations.includes(extension)) {
    recommendations.push(extension);
  }

  extensions.recommendations = recommendations;
  tree.write(filePath, JSON.stringify(extensions));
}
