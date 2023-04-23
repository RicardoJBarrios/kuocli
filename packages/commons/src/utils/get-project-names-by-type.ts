import { getProjects, ProjectType, Tree } from '@nrwl/devkit';

/**
 * Gets a list of project names by type.
 * @param tree Virtual file system tree.
 * @param projectType Type of project supported.
 * @returns A list of project names by type.
 *
 * @example
 * ```ts
 * getProjectNamesByType(tree); // ['app','lib']
 * getProjectNamesByType(tree, 'application'); // ['app']
 * getProjectNamesByType(tree, 'library'); // ['lib']
 * ```
 */
export function getProjectNamesByType(tree: Tree, projectType: ProjectType): string[] {
  return [...getProjects(tree).values()]
    .filter((config) => projectType === config.projectType)
    .map((config) => config.name);
}
