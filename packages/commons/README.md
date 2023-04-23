# @kuocli/commons

The Commons [Nx](https://nx.dev/) Plugin contains generators and utilities for managing applications and libraries within an Nx workspace.

Much of my work involves initializing and structuring frontend applications and repositories. This is a repetitive task where I always find myself reviewing past projects so I don't leave behind useful settings.

This plugin is a method to automate these tasks and reduce setup times. The idea is to code them as generic as possible, so that they can be generated in practically any existing Nx repository. I also try to make them as non-destructive as possible with existing setups.

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

- [gitlint](./src/generators/gitlint/README.md): Adhere the workspace to a git commit convention.
- [codelint](./src/generators/codelint/README.md): Static check on source code to detect stylistic or programmatic errors.

## Utils

This functions have been created to help in the creation and testing of Nx generators.

### addScript

```ts
function addScript(tree: Tree, name: string, code: string): void;
```

Adds a script to the `package.json` avoiding repeat code.

```ts
addScript(tree, 'a', 'a'); // { scripts: { a: 'a' } }
addScript(tree, 'a', 'a'); // { scripts: { a: 'a' } }
addScript(tree, 'a', 'b'); // { scripts: { a: 'a && b' } }
```

### cleanArray

```ts
function cleanArray<T>(array: T[]): T[];
```

Cleans values from an Array.

```ts
cleanArray(['a ', '', null, undefined, ' a']); // ['a']
```

### getDependencies

```ts
function getDependencies(tree: Tree, ...filterTypes: DependencyType[]): string[];
```

Gets the list of package names in `package.json`.

```ts
type DependencyType =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'peerDependenciesMeta'
  | 'bundleDependencies'
  | 'optionalDependencies';
```

```ts
getDependencies(tree); // ['pkg', 'devPkg']
getDependencies(tree, 'devDependencies'); // ['devPkg']
```

### getProjectNamesByType

```ts
function getProjectNamesByType(tree: Tree, projectType: ProjectType): string[];
```

Gets a list of project names by type.

```ts
getProjectNamesByType(tree); // ['app','lib']
getProjectNamesByType(tree, 'application'); // ['app']
getProjectNamesByType(tree, 'library'); // ['lib']
```

### mergeWithArray

```ts
function mergeWithArray<T = Record<string, unknown>>(obj: T, ...sources: object[]): T;
```

Deep merges properties of source objects to the destination object.

Returns the merged objects, concatenating Arrays without duplicates or empty values.

```ts
const a = { a: [0, 1], b: { a: 0, b: 0 } };
const b = { a: [0, 2], b: { a: 1, c: 0 } };
mergeWithArray(a, b); // { a: [0, 1, 2], b: { a: 1, b: 0, c: 0 } }
```

### removeConfig

```ts
function removeConfig(tree: Tree, path: string): string | undefined;
```

Removes a config value in package.json or a config file.

Returns the deleted config value.

```ts
removeConfig(tree, 'test'); // deletes .testrc; returns the content
```

### stringContains

```ts
function stringContains(str: string, subStr: string): boolean;
```

Search whole substring in a string.

Returns true if the whole substring exists in the string. False otherwise.

```ts
stringContains('a', 'b'); // false
stringContains('aa', 'a'); // false
stringContains('a a', 'a'); // true
```

### upsertHuskyHook

```ts
function upsertHuskyHook(tree: Tree, hook: string, ...scripts: string[]): void;
```

Creates or updates a Husky hook avoiding repeat code.

```ts
upsertHuskyHook(tree, 'pre-commit', 'echo A', 'echo B', 'echo A');
// creates or updates .husky/pre-commit
// adds "echo A\necho B" to the hook
```

### upsertVSCodeRecommendations

```ts
function upsertVSCodeRecommendations(tree: Tree, ...extensions: string[]): void;
```

Creates or updates the VSCode extension recommendations.

```ts
upsertVSCodeRecommendations(tree, 'ext1', 'ext2');
// { "recommendations": ["ext1","ext2"] }
```

### upsertVSCodeSettings

```ts
function upsertVSCodeSettings(tree: Tree, settings: Record<string, unknown>): void;
```

Creates or updates the VSCode settings file with the settings.

```ts
upsertVSCodeSettings(tree, { a: 0 }); // { "a": 0 }
upsertVSCodeSettings(tree, { b: 0 }); // { "a": 0, "b": 0 }
```
