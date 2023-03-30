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

- [gitlint](./src/generators/gitlint/README.md): Adhere the workspace to a git commit convention.
- [codelint](./src/generators/codelint/README.md): Static check on source code to detect stylistic or programmatic errors.

## Utils

This functions have been created to help in the creation and testing of Nx generators.

### addIdePluginRecommendations

```ts
function addIdePluginRecommendations(tree: Tree, ...extensions: string[]): Record<string, unknown>;
```

Adds plugin recommendations to the IDE.

### addIdeSettings

```ts
function addIdeSettings(tree: Tree, settings: Record<string, unknown>): Record<string, unknown>;
```

Adds settings to the IDE.

### addScriptToWorkspace

```ts
function addScriptToWorkspace(tree: Tree, scriptName: string, scriptCode: string): void;
```

Adds a script to the workspace's package.json.

If the script name exists and is not duplicated, adds the code to be executed after the current code.

### cleanStringArray

```ts
function cleanStringArray(array: string[]): string[];
```

Cleans values from an Array of strings.

Returns the Array without duplicates, nil or empty values and value's ending and trailing white space.

### DEPENDENCY_TYPE

```ts
type DEPENDENCY_TYPE =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'peerDependenciesMeta'
  | 'bundleDependencies'
  | 'optionalDependencies';
```

The dependency type in package.json.

### getJsonFile

```ts
function getJsonFile(tree: Tree, filePath: string): Record<string, unknown> | null;
```

Returns the parsed JSON file value or null if the file doesn't exist or is not a valid JSON file.

### getProjectNamesByType

```ts
function getProjectNamesByType(tree: Tree, projectType: ProjectType): string[];
```

Gets the list of workspace project names by type.

### getWorkspaceDependencies

```ts
function getWorkspaceDependencies(tree: Tree, ...filterTypes: DEPENDENCY_TYPE[]): string[];
```

Gets the list of library names in the workspace package.json dependencies.

### mergeWithArray

```ts
function mergeWithArray<T extends Record<string, unknown>, K = T>(obj: T, ...sources: K[]): T | K;
```

Merges properties, including Arrays, of source objects to the destination object.

### upsertJsonFile

```ts
function upsertJsonFile(
  tree: Tree,
  filePath: string,
  mutator: (json: Record<string, unknown>) => Record<string, unknown>
): Record<string, unknown> | null;
```

Creates or updates a JSON file.

Returns the mutated JSON or null if the content is not a valid JSON file or throws.
