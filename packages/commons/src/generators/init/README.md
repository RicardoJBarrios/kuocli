# @kuocli/commons:init

> Add the default git and code linting configuration to the workspace.

- Add gitlint
- Add codelint
- Add semver

## Usage

```bash
nx generate @kuocli/commons:init
```

Show what will be generated without writing to disk:

```bash
nx generate @kuocli/commons:init --dry-run
```

## Options

### skipFormat

- Type: boolean
- Default: false

Skip formatting files.

```bash
nx generate @kuocli/commons:init --skipFormat true
```
