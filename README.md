# GitHub Flow Agency Action

A lightweight **Node.js GitHub Action** that generates dynamic, human-readable **job titles** for AI agents in GitHub Flow pipelines.

It takes context from the upstream router (`job-type`, `target-environment`, `has-interesting-changes`) and produces a realistic title like:

- `Software Test Engineer (Production) – Change-Driven`
- `Site Reliability Engineer (Preview) – Stable`
- `Code Review Specialist`

Titles are customizable via an optional `agency-config.json` file in the repo root.

## Features

- Realistic, professional job titles framed as AI agents
- Environment-aware modifiers (Production, Preview, Nightly, …)
- Change-impact awareness (Change-Driven / Stable)
- Falls back gracefully when config is missing or job-type unknown
- Zero external dependencies beyond `@actions/core`
- Fully local-testable with `act` (no network calls)

## Inputs

| Name                        | Description                                                                 | Required | Default     | Example             |
|-----------------------------|-----------------------------------------------------------------------------|----------|-------------|---------------------|
| job-type                    | Role family from router (tests, deploy, ai-review, docs, …)                 | true     | —           | `tests`             |
| target-environment          | Deployment context (preview, production, tag-release, nightly, …)          | false    | `unknown`   | `production`        |
| has-interesting-changes     | Whether meaningful code changes were detected (`true`/`false`/`unknown`)    | false    | `unknown`   | `true`              |

## Outputs

| Name       | Description                                                                 | Example value                                      |
|------------|-----------------------------------------------------------------------------|----------------------------------------------------|
| job-title  | Generated full job title with appropriate modifiers                         | `Software Test Engineer (Production) Change-Driven` |
| status     | `success` if title generated, `error` on critical failure                   | `success`                                          |

## Quick Start (Usage in Your Repo)

```yaml
jobs:
  router:
    uses: brainxio/github-flow-router@v1.0.0
    id: router

  agency:
    needs: router
    uses: brainxio/github-flow-agency@v1.0.0
    id: agency
    with:
      job-type:               ${{ steps.router.outputs.job-type }}
      target-environment:     ${{ steps.router.outputs.target-environment }}
      has-interesting-changes: ${{ steps.router.outputs.has-interesting-changes }}

  manager:
    needs: [router, agency]
    if: always()  # or more specific condition
    runs-on: ubuntu-latest
    steps:
      - name: Show AI agent role
        run: echo "Running as: ${{ steps.agency.outputs.job-title }}"
```

## Customization (agency-config.json)

Place this file in your repo root to override defaults:

```json
{
  "defaults": {
    "titleBase": "AI Agent"
  },
  "jobTypes": {
    "tests":        { "titleBase": "Software Test Engineer" },
    "deploy":       { "titleBase": "Site Reliability Engineer" },
    "ai-review":    { "titleBase": "Code Review Specialist" },
    "docs":         { "titleBase": "Technical Documentation Engineer" },
    "release-tasks": { "titleBase": "Release Orchestration Engineer" },
    "nightly-tasks": { "titleBase": "Repository Maintenance Engineer" }
  }
}
```

If missing or invalid → falls back to `"AI Agent"`.

## Local Development & Testing

```bash
# One-time setup (downloads act, shellcheck, npm deps)
make setup

# Run default test (push event simulation)
make test

# Or specific scenarios
make test-dispatch     # manual workflow_dispatch (easiest for input overrides)
make test-main         # push to main
make test-pr           # pull request
make test-tag-push     # tag push
```

Recommended: use `make test-dispatch` and override inputs interactively.

## Development Setup

1. Clone the repo
2. `make setup`
3. Edit `index.js`, `action.yml`, or `agency-config.json`
4. Test with `make test*`
5. Commit & push feature branch
6. Open PR → squash-merge → tag vX.Y.Z

## Roadmap (v1.0 Target)

- [x] Core title generation logic (job-type → base title)
- [x] Environment & change modifiers
- [x] agency-config.json loading + graceful fallback
- [x] Outputs: job-title + status
- [x] Full local act testing with setup-node + npm ci
- [x] ESM migration + @actions/core@3.0.0 compatibility
- [ ] Comprehensive README with badges, more examples
- [ ] Issue & PR templates
- [ ] Automated semantic release workflow (on main)
- [ ] Optional: add skill-level / duration / short-description outputs
- [ ] Optional: embed full job description templates in config

## License

Unlicense — public domain. Do whatever you want.

Enjoy giving your AI agents proper job titles!
