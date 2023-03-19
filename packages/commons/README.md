# @kuocli/commons

The Commons [Nx](https://nx.dev/) Plugin contains generators and utilities for managing Kuoki applications and libraries within an Nx workspace.

## Setting up the Commons plugin

Adding the Commons plugin to an existing Nx workspace can be done with the following:

```bash
yarn add -D @kuocli/commons
```

```bash
npm install -D @kuocli/commons
```

## Generators

- [@kuocli/commons:gitlint](./src/generators/gitlint/README.md): Adhere the workspace to a git commit convention.

## Utils

This functions have been created to help in the creation and testing of Nx generators.

```ts
function filterEmptyStringValues(array: string[]): string[];
```

Filters empty string values from an Array.

```ts
function getProjectNamesByType(tree: Tree, projectType: ProjectType): string[];
```

Gets the list of workspace project names by type.

```ts
function getJsonFile(tree: Tree, path: string): Record<string, unknown> | null;
```

Gets a parsed JSON File or null if the file doen't exists.

```ts
function getWorkspaceDependencies(tree: Tree): string[];
```

Gets the dependencies from the workspace package.json.

```ts
function getWorkspaceDevDependencies(tree: Tree): string[];
```

Gets the devDependencies from the workspace package.json.

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
