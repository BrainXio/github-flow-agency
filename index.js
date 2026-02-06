import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    // Determine workspace (repo root in Actions)
    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();

    // Load config or fall back to defaults
    let config = {};
    const configPath = path.join(workspace, 'agency-config.json');

    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configContent);
        core.info('Loaded agency-config.json successfully');
      } catch (parseErr) {
        core.warning(`Failed to parse agency-config.json: ${parseErr.message}. Using defaults.`);
      }
    } else {
      core.info('agency-config.json not found in repo root. Using hardcoded defaults.');
    }

    const defaults = config.defaults || { titleBase: 'AI Agent' };
    const jobTypes = config.jobTypes || {};

    // Get inputs (required/optional with defaults)
    const jobType = core.getInput('job-type', { required: true }).trim();
    const targetEnvironment = core.getInput('target-environment').trim() || 'unknown';
    const hasInterestingChanges = core.getInput('has-interesting-changes').trim() || 'unknown';

    // Resolve title base
    let titleBase = defaults.titleBase;
    if (jobTypes[jobType] && jobTypes[jobType].titleBase) {
      titleBase = jobTypes[jobType].titleBase;
    } else if (jobType !== '') {
      core.warning(`Job type "${jobType}" not found in config. Using default title base.`);
    }

    // Build modifiers
    const modifiers = [];

    if (targetEnvironment !== 'unknown' && targetEnvironment !== '') {
      const capitalizedEnv = targetEnvironment.charAt(0).toUpperCase() + targetEnvironment.slice(1).toLowerCase();
      modifiers.push(`(${capitalizedEnv})`);
    }

    if (hasInterestingChanges === 'true') {
      modifiers.push('Change-Driven');
    } else if (hasInterestingChanges === 'false') {
      modifiers.push('Stable');
    }
    // 'unknown' → no modifier (intentional – keeps title clean)

    // Construct final title
    const jobTitle = [titleBase, ...modifiers].join(' ').trim();

    // Set outputs
    core.setOutput('job-title', jobTitle);
    core.setOutput('status', 'success');

    core.info(`Generated job title: ${jobTitle}`);
  } catch (error) {
    core.setOutput('status', 'error');
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();