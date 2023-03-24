# @kuocli/commons:codelint

> Static check on source code to detect stylistic or programmatic errors.

- Add prettier
  - Add prettier config
- Add Husky
  - lint fix changes before commit (no error)
  - format changes before commit
- Add lint-staged
- Add eslint-plugin-simple-import-sort (replace rbbit.typescript-hero)
- Add eslint-plugin-unused-imports (replace rbbit.typescript-hero)
- Add sonarlint
- Add scripts to check npm packages security

## Usage

```bash
nx generate @kuocli/commons:codelint
```

Show what will be generated without writing to disk:

```bash
nx generate @kuocli/commons:codelint --dry-run
```

## Options

### skipFormat

- Type: boolean
- Default: false

Skip formatting files.

```bash
nx generate @kuocli/commons:gitlint --skipFormat true
```
