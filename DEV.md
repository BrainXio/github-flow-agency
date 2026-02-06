# Developer Guide for GitHub Flow Agency

This guide covers patterns for enhancing the action, such as adding new outputs, extending modifiers, or updating bundled defaults.

## Architecture Overview

- `action.yml`: Defines inputs/outputs — update here for new ones.
- `index.js`: Core logic (ESM, @actions/core) — load config, resolve values, set outputs.
- `agency-config.json`: Bundled defaults (titleBase, skillLevel, etc.) — update for new job-types or fields.
- Fallback: User's repo config overrides bundled one.
- No network calls — keep it local/fast.

## Extending the Action

To add a new output (e.g. "requirements"):

1. Update `agency-config.json`:
   Add to defaults and jobTypes (e.g. "requirements": "List of tools needed").

2. Update `index.js`:
   - Add to defaults fallback.
   - Resolve from jobConfig or defaults.
   - core.setOutput('requirements', value).

3. Update `action.yml`:
   Add new output description.

4. Update `test-agency.yml`:
   - Add to matrix include (test with/without).
   - Show in "Show result" step.

5. Update README.md:
   - Add to Outputs table.
   - Example in Quick Start.

Keep graceful fallbacks (warnings for missing keys).

## Patterns for Enhancements

- New modifiers: Add to modifiers array in index.js (based on inputs).
- New job-types: Add to bundled agency-config.json, test in matrix.
- Deps: Keep minimal (only @actions/core).
- Testing: All changes must pass make test (matrix coverage).
- Releases: Use feat/fix for bumps, docs/chore for no bump.

Follow CONTRIBUTING.md for branching/commits/PRs.
