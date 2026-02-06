# GitHub Flow Agency Action

A lightweight **Node.js GitHub Action** that generates dynamic, realistic job titles for AI agents in GitHub Flow pipelines.

It takes inputs from the upstream router (`job-type`, `target-environment`, `has-interesting-changes`) and produces human-readable titles such as:

- `Software Test Engineer (Production) – Change-Driven`
- `Site Reliability Engineer (Preview) – Stable`
- `Code Review Specialist`

Titles are customizable via an optional `agency-config.json` in the repo root.

## Features

- Professional job titles framed as AI agents
- Environment-aware modifiers (Production, Preview, Nightly, …)
- Change-impact awareness (Change-Driven / Stable)
- Falls back gracefully when config is missing or job-type unknown
- Zero external calls — pure local string manipulation
- Minimal dependencies (`@actions/core` only)
- Strong local testability with `act` (full matrix coverage of all job types)

## Inputs

| Name                        | Description                                                                 | Required | Default     | Example              |
|-----------------------------|-----------------------------------------------------------------------------|----------|-------------|----------------------|
| job-type                    | Role family (e.g. tests, deploy, ai-review, docs, release-tasks, nightly-tasks) | yes      | —           | `tests`              |
| target-environment          | Deployment context (preview, production, tag-release, nightly, …)          | no       | `unknown`   | `production`         |
| has-interesting-changes     | Whether meaningful code changes were detected (`true`/`false`/`unknown`)    | no       | `unknown`   | `true`               |

## Outputs

| Name        | Description                                                                 | Example value                                      |
|-------------|-----------------------------------------------------------------------------|----------------------------------------------------|
| job-title   | Generated full job title with appropriate modifiers                         | `Software Test Engineer (Production) Change-Driven` |
| status      | `success` if title generated, `error` on critical failure                   | `success`                                          |

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

Missing file / invalid JSON / unknown job-type → falls back to `"AI Agent"`.

## Local Development & Testing

Requires **Node.js ≥20** (use nvm recommended):

```bash
# One-time: install nvm if missing
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc   # or ~/.zshrc

nvm install 20
nvm use 20
nvm alias default 20
```

Then:

```bash
# Install act, shellcheck, npm deps
make setup

# Run full test suite (matrix over all job-types + variants)
make test

# Or interactive mode (override inputs manually)
make test-dispatch
```

The default `make test` runs a matrix that covers every `job-type` in `agency-config.json`, fallback case, and key modifier combinations.

## Development Setup

1. Clone the repo  
2. `make setup` — downloads `act`, installs shellcheck, runs `npm ci`  
3. Edit `index.js`, `action.yml`, or `agency-config.json`  
4. `make test` or `make test-dispatch` — validate locally  
5. Commit & push feature branch  
6. Open PR → squash-merge → tag release

## Project Status / Roadmap to v1.0

- [x] Core title generation from job-type
- [x] Environment & change modifiers
- [x] agency-config.json loading + fallback
- [x] Outputs: `job-title` + `status`
- [x] ESM + `@actions/core@3.0.0` compatibility
- [x] Comprehensive local matrix testing with `act`
- [x] Clean Makefile + Node 20 setup guidance
- [ ] Improve: skill-level, duration, short description outputs
- [ ] GitHub issue & PR templates
- [ ] Automated semantic-release workflow on main
- [ ] Final README polish (badges, more examples)

## License

Unlicense — do whatever you want. No restrictions.

Enjoy giving your AI agents proper job titles!
