# GitHub Flow Agency Action

<p align="center">
  <a href="https://github.com/brainxio/github-flow-agency">
    <img src="https://github.com/brainxio.png" alt="Logo" width="72" height="72">
  </a>

  <h3 align="center">GitHub Flow Agency Action</h3>

  <p align="center" style="font-size: 1.1em; font-style: italic;">
    A lightweight Node.js GitHub Action that generates dynamic, realistic job titles, skill levels, duration estimates<br>
    and short descriptions for AI agents in GitHub Flow pipelines — based on router context.
  </p>

  <p align="center">
    <a href="https://github.com/brainxio/github-flow-agency/issues/new?template=bug_report.md">Report Bug</a>
    ·
    <a href="https://github.com/brainxio/github-flow-agency/issues/new?template=feature_request.md&labels=enhancement">Request Feature</a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/brainxio/github-flow-agency/releases">
    <img src="https://img.shields.io/github/v/release/brainxio/github-flow-agency?color=green&logo=github" alt="GitHub Release">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-Unlicense-blue.svg" alt="License: Unlicense">
  </a>
  <a href="https://github.com/brainxio/github-flow-agency/stargazers">
    <img src="https://img.shields.io/github/stars/brainxio/github-flow-agency?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/brainxio/github-flow-agency/network/members">
    <img src="https://img.shields.io/github/forks/brainxio/github-flow-agency?style=social" alt="GitHub forks">
  </a>
</p>

## Features

- Professional job titles framed as AI agents
- Environment-aware modifiers (Production, Preview, Nightly, …)
- Change-impact suffixes (Change-Driven / Stable)
- Skill level, duration estimate, and short description outputs
- Graceful fallback when config is missing or job-type unknown
- Bundled defaults — great experience with zero configuration
- Zero external calls — pure local string manipulation
- Minimal dependencies (`@actions/core` only)
- Strong local testability with `act` (full matrix coverage)

## Inputs

| Name                        | Description                                                                 | Required | Default     | Example              |
|-----------------------------|-----------------------------------------------------------------------------|----------|-------------|----------------------|
| job-type                    | Role family (e.g. tests, deploy, ai-review, docs, release-tasks, nightly-tasks) | yes      | —           | `tests`              |
| target-environment          | Deployment context (preview, production, tag-release, nightly, …)          | no       | `unknown`   | `production`         |
| has-interesting-changes     | Whether meaningful code changes were detected (`true`/`false`/`unknown`)    | no       | `unknown`   | `true`               |

## Outputs

| Name              | Description                                                                 | Example value                                      |
|-------------------|-----------------------------------------------------------------------------|----------------------------------------------------|
| job-title         | Generated full job title with modifiers                                     | `Software Test Engineer (Production) Change-Driven` |
| skill-level       | Estimated skill level required (Junior / Mid / Senior / Lead)               | `Senior`                                           |
| duration-estimate | Rough time estimate for the task                                            | `5-15 minutes`                                     |
| short-description | 1-2 sentence summary of responsibilities                                    | `Deploys updates safely to production or preview`  |
| status            | `success` if outputs generated, `error` on failure                          | `success`                                          |

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
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Show AI agent role
        run: |
          echo "Running as: ${{ steps.agency.outputs.job-title }}"
          echo "Skill level: ${{ steps.agency.outputs.skill-level }}"
          echo "Est. duration: ${{ steps.agency.outputs.duration-estimate }}"
          echo "Description: ${{ steps.agency.outputs.short-description }}"
```

## Customization (agency-config.json)

Place this file in your repo root to override defaults:

```json
{
  "defaults": {
    "titleBase": "AI Agent",
    "skillLevel": "Mid",
    "durationEstimate": "5-15 minutes",
    "shortDescription": "General-purpose AI agent handling standard tasks."
  },
  "jobTypes": {
    "tests": {
      "titleBase": "Software Test Engineer",
      "skillLevel": "Mid",
      "durationEstimate": "3-10 minutes",
      "shortDescription": "Runs automated tests and validates behavior after changes."
    }
    // ... other job types ...
  }
}
```

If missing → uses the bundled defaults shipped with the action.

## Local Development & Testing

Requires **Node.js ≥20** (use nvm recommended):

```bash
nvm install 20
nvm use 20
```

Then:

```bash
make setup
make test           # full matrix (all job-types + variants)
make test-dispatch  # interactive input overrides
```

## Development Setup

1. Clone the repo  
2. `make setup` — downloads `act`, installs shellcheck, runs `npm ci`  
3. Edit `index.js`, `action.yml`, or `agency-config.json`  
4. `make test` — validate locally  
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
- [x] Improve: skill-level, duration, short description outputs
- [x] GitHub issue & PR templates
- [x] Automated semantic-release workflow on main
- [x] Final README polish (badges, more examples)

## License

Unlicense — do whatever you want. No restrictions.

Enjoy giving your AI agents proper job titles!
