# Contributing to GitHub Flow Agency

Thanks for your interest in contributing! This guide explains how to get started, the development patterns we follow, and how to submit changes.

## Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/BrainXio/github-flow-agency.git
   cd github-flow-agency
   ```

2. Install Node.js ≥20 (use nvm recommended):

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   source ~/.bashrc  # or ~/.zshrc
   nvm install 20
   nvm use 20
   nvm alias default 20
   ```

3. Install dependencies and tools:

   ```bash
   make setup  # Downloads act, shellcheck, npm deps
   ```

## Branching Strategy

We use GitHub Flow:
- `main`: Production-ready code.
- Feature branches: `feat/<short-description>` for new features (e.g., `feat/add-requirements-output`).
- Fix branches: `fix/<short-description>` for bugs (e.g., `fix/config-loading-edge-case`).
- No direct commits to `main` — all changes via PRs.

Create a branch:
```bash
git checkout -b feat/my-new-feature
```

## Commit Conventions

Use conventional commits for semantic-release to determine version bumps:
- `feat:` New feature (minor bump).
- `fix:` Bug fix (patch bump).
- `docs:` Documentation only (no bump).
- `chore:` Maintenance (no bump).
- `test:` Tests (no bump).
- `ci:` CI config (no bump).
- Add `BREAKING CHANGE:` in body for major bumps.

Example:
```bash
git commit -m "feat: add requirements output

- Extend agency-config.json with requirements field
- Update index.js to set new output
- Add to action.yml and tests"
```

## Testing Patterns

- Use `make test` for full matrix (all job-types, modifiers, fallback).
- For new outputs/features: Add matrix combinations in `.github/workflows/test-agency.yml`.
- Local smoke test: `make test-dispatch` with input overrides.
- Keep tests fast, no network calls.

## Pull Requests

- Use the PR template (.github/pull_request_template.md).
- Self-review code.
- Ensure all checks pass (tests, preview release dry-run).
- Squash-merge PRs for clean history.

## Release Process

- Merge to `main` triggers semantic-release (auto-bump, tag, changelog, GitHub Release).
- No manual tags — use conventional commits to control bumps.

For questions, open an issue with the bug/feature template.

Thanks for contributing!
