# @kuocli/commons:gitlint

Adhere the workspace to a git commit convention.

## Usage

```bash
nx generate @kuocli/commons:gitlint
```

This generator adds and configures [commitlint](https://commitlint.js.org/), [husky](https://typicode.github.io/husky/#/) and [commitizen](http://commitizen.github.io/cz-cli/) to the workspace to force the use of [conventional commits](https://www.conventionalcommits.org/) on git commits.

Running `git commit` will display a prompt that will guide the user to complete a Git Commit containing all the necessary items configured in the linter, and `husky` will ensure that those rules are followed or will abort the commit.

![cz-commitlint](https://commitlint.js.org/assets/cz-commitlint.png)

To modify the default behavior modify the following values in the generated `/commitlintrc` file:

- [rules](https://commitlint.js.org/#/reference-rules): any rules defined here will override rules from @commitlint/config-conventional, so use it carefully. Is highly recomended to restrict the scopes, and it's done by default in the generation by adding the existing application and libraries names to `scope-enum`.
- [prompt](https://commitlint.js.org/#/reference-prompt): configures the commit prompt settings when using @commitlint/cz-commitlint. This allows to change the text of the options, add emojis, skip steps, etc.

Show what will be generated without writing to disk:

```bash
nx generate @kuocli/commons:gitlint --dry-run
```

## Options

### appScopes

- Type: boolean
- Default: true

Add existing applications as commit scopes.

### libScopes

- Type: boolean
- Default: true

Add existing libraries as commit scopes.

### scopes

- Type: string

A comma-separated list of custom commit scopes.

### skipFormat

- Type: boolean
- Default: false

Skip formatting files.
