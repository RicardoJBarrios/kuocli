# @kuocli/commons

The Commons [Nx](https://nx.dev/) Plugin contains generators and utilities for managing applications and libraries within an Nx workspace.

Much of my work and hobbies involves initializing and structuring frontend applications and repositories. This is a repetitive task where I always find myself reviewing past projects so I don't leave learned settings behind.

This plugin is a method to automate these tasks and reduce setup times.

## Setting up the Commons plugin

Adding the Commons plugin to an existing Nx workspace can be done with the following:

```bash
npm install -D @kuocli/commons
```

```bash
yarn add -D @kuocli/commons
```

## Package reference

Here is a list of all the executors and generators available from this package.

### Executors

None.

### Generators

- [init](./src/generators/init/README.md): Add the default git and code linting configuration to the workspace.
- [gitlint](./src/generators/gitlint/README.md): Adhere the workspace to a git commit convention.
- [codelint](./src/generators/codelint/README.md): Static check on source code to detect stylistic or programmatic errors.
- [semver](./src/generators/semver/README.md): Versioning using SemVer and CHANGELOG generation.

## Utils

This functions have been created to help in the creation and testing of Nx generators.

### filterEmptyStringValues

```ts
function filterEmptyStringValues(array: string[]): string[];
```

Filters empty string values from an Array.

### getProjectNamesByType

```ts
function getProjectNamesByType(tree: Tree, projectType: ProjectType): string[];
```

Gets the list of workspace project names by type.

### getJsonFile

```ts
function getJsonFile(tree: Tree, path: string): Record<string, unknown> | null;
```

Gets a parsed JSON File or null if the file doen't exists.

### getWorkspaceDependencies

```ts
function getWorkspaceDependencies(tree: Tree): string[];
```

Gets the dependencies from the workspace package.json.

### getWorkspaceDevDependencies

```ts
function getWorkspaceDevDependencies(tree: Tree): string[];
```

Gets the devDependencies from the workspace package.json.

### addScriptToWorkspace

```ts
function addScriptToWorkspace(
  tree: Tree,
  scriptName: string,
  script: string
): void;
```

Adds a script to the workspace package.json. If the script name exists adds the code to be executed after the current code.

```js
// /package.json
{
  "scripts": {
    "prepare": 'echo DONE';
  }
}

addScriptToWorkspace(tree, "notDone", "echo NOT DONE");
addScriptToWorkspace(tree, "prepare", "echo DONE AGAIN");

// /package.json
{
  "scripts": {
    "notDone": "echo NOT DONE"
    "prepare": 'echo DONE && echo DONE AGAIN';
  }
}
```
