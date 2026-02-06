import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    let config = {};

    // 1. Try to load from the calling repo (user's project)
    const userConfigPath = path.join(workspace, 'agency-config.json');
    if (fs.existsSync(userConfigPath)) {
      try {
        const configContent = fs.readFileSync(userConfigPath, 'utf8');
        config = JSON.parse(configContent);
        core.info('Loaded agency-config.json from repository root');
      } catch (parseErr) {
        core.warning(`Failed to parse repository agency-config.json: ${parseErr.message}. Falling back to bundled defaults.`);
      }
    } else {
      // 2. No user config → load the bundled one from the action itself
      const bundledConfigPath = path.join(__dirname, 'agency-config.json');
      if (fs.existsSync(bundledConfigPath)) {
        const bundledContent = fs.readFileSync(bundledConfigPath, 'utf8');
        config = JSON.parse(bundledContent);
        core.info('No agency-config.json in repository. Using bundled defaults from the action.');
      } else {
        // This should never happen in a tagged release, but safe fallback
        core.warning('Bundled agency-config.json not found. Using minimal fallback defaults.');
        config = {
          defaults: {
            titleBase: "AI Agent",
            skillLevel: "Mid",
            durationEstimate: "5-15 minutes",
            shortDescription: "General-purpose AI agent handling standard tasks."
          },
          jobTypes: {}
        };
      }
    }

    const defaults = config.defaults || {
      titleBase: "AI Agent",
      skillLevel: "Mid",
      durationEstimate: "5-15 minutes",
      shortDescription: "General-purpose AI agent handling standard tasks."
    };

    const jobTypes = config.jobTypes || {};

    const jobType = core.getInput('job-type', { required: true }).trim();
    const targetEnvironment = core.getInput('target-environment').trim() || 'unknown';
    const hasInterestingChanges = core.getInput('has-interesting-changes').trim() || 'unknown';

    const jobConfig = jobTypes[jobType] || {};
    let titleBase        = jobConfig.titleBase        ?? defaults.titleBase;
    let skillLevel       = jobConfig.skillLevel       ?? defaults.skillLevel;
    let durationEstimate = jobConfig.durationEstimate ?? defaults.durationEstimate;
    let shortDescription = jobConfig.shortDescription ?? defaults.shortDescription;

    if (!jobTypes[jobType] && jobType !== '') {
      core.warning(`Job type "${jobType}" not found in config. Using defaults.`);
    }

    // Build title modifiers
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

    const jobTitle = [titleBase, ...modifiers].join(' ').trim();

    // Set outputs
    core.setOutput('job-title', jobTitle);
    core.setOutput('skill-level', skillLevel);
    core.setOutput('duration-estimate', durationEstimate);
    core.setOutput('short-description', shortDescription);
    core.setOutput('status', 'success');

    core.info(`Generated job title:        ${jobTitle}`);
    core.info(`Skill level:               ${skillLevel}`);
    core.info(`Estimated duration:        ${durationEstimate}`);
    core.info(`Short description:         ${shortDescription}`);

  } catch (error) {
    core.setOutput('status', 'error');
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();