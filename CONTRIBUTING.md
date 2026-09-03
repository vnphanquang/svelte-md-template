# Contributing to `svelte-md-template`

Thank you for stopping by. `svelte-md-template` welcomes and appreciates your contribution.

## Issues

> [!IMPORTANT]
> Before opening a new issue, [first search for existing issues][github.issues.open] to avoid duplications. When you start working on an issue, make sure you are asked to be assigned to it.

### Bug Report

Please include as much details as possible:

- steps to reproduce,
- screenshots.

### Feature Request

If you have an idea and don't know where to start yet, consider [opening a discussion][github.discussions] first. If you have a PR ready as your proposed implementation, you can [create an issue][github.issues] and a PR that references it.

## Development

### Prerequisites

| Tool         | Version            |
| ------------ | ------------------ |
| [Node]       | see [package.json] |
| [pnpm]       | see [package.json] |
| [Lefthook]   | see [lefthook.yml] |
| [Playwright] | see [playwright]   |

The project also supports [devenv]. Simply activate with `devenv shell` or set up [Auto Activation](https://devenv.sh/auto-activation/).

### Tmux Template

There is an executable bash script at the project root named [.tmux.template], which spawns a recommended [tmux] session for convenience.

## Code standard

> [!IMPORTANT]
> Rules are to be broken. There will always be exceptions. The following guidelines are not set in stone, but rather a set of recommendations to help us work together more effectively.

### What is a Good Commit / Pull Request?

A commit should strive to be:

1. atomic: have a descriptive message that hints at what the commit is about, exceptionally helpful for other contributors and PR reviewers.
2. encapsulated: represent a complete change, i.e a single feature, bug fix, or refactor that can make sense on its own.
3. executable: ideally capture a working state of the application / site. If not, it should be marked as `[WIP]` in its commit message.
4. minimal: span a limited scope and has as small of a footprint as possible. If a commit does too much or contains changes to many files, it is an indicator that the changes may be broken down into smaller commits.

Similarly, each pull request (PR) should work towards one issue or self-contained goal. The preference for merge strategy is as follow:

- if PR contains a single commit, `merge rebase` (fast-forward),
- if there are multiple commits and you want to keep the merge history, prefer `merge commit` over `squash`, unless there are dirty commits in the branch.

### Commit Message Guidelines

We follow the [Conventional Commits][conventionalcommits] guidelines for writing git commit message. Please familiarize yourself with the guidelines and be consistent.

```bash
[feat | fix | chore](scope): "[message beginning with a verb: add | change | remove]"
```

### Code Style Enforcement

This project uses [eslint] & [prettier] for code linting and formatting. Make sure to install necessary plugins or integrations in your code editor.

[lefthook] is setup to run format and lint checks as a `pre-commit` [git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks).
To bypass hook (not recommended, for admin only), run `git commit` with the `--no-verify` flag.

[github]: https://github.com/vnphanquang/svelte-md-template
[github.issues]: https://github.com/vnphanquang/svelte-md-template/issues?q=
[github.issues.open]: https://github.com/vnphanquang/svelte-md-template/issues?q=is%3Aissue+is%3Aopen
[github.discussions]: https://github.com/vnphanquang/svelte-md-template/discussions
[conventionalcommits]: https://www.conventionalcommits.org/en/v1.0.0/
[node]: https://nodejs.org/en/
[pnpm]: https://pnpm.io/
[eslint]: https://eslint.org/
[prettier]: https://prettier.io/
[lefthook.yml]: ./lefthook.yml
[package.json]: ./package.json
[.template.tmux]: ./.template.tmux
[playwright]: https://playwright.dev/
[devenv]: https://devenv.sh/
[tmux]: https://github.com/tmux/tmux
