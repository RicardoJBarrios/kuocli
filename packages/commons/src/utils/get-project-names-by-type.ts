import { getProjects, ProjectType, Tree } from '@nrwl/devkit';

/**
 * Gets the list of workspace project names by type.
 * @param tree Virtual file system tree.
 * @param projectType Type of project.
 * @returns A list of workspace project names by type.
 */
export function getProjectNamesByType(tree: Tree, projectType: ProjectType): string[] {
  return [...getProjects(tree).values()]
    .filter((config) => projectType === config.projectType)
    .map((config) => config.name);
}
