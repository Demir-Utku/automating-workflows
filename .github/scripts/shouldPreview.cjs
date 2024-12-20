const { getPullRequest } = require('./utils/github.cjs');
const { getTaskKeys } = require('./utils/jira.cjs');

/**
 * Check if a PR is eligible for preview deployment.
 * 
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async function ({ github, context, core }) {
  const { number: issueNumber } = context.issue;
  const { owner, repo } = context.repo;

  core.info(`Checking if PR #${issueNumber} is eligible for preview deployment...`);

  const pull = await getPullRequest(github, owner, repo, issueNumber);

  const cleanedTitle = pull.title.replace(`#${issueNumber}`, '');

  // Get the Jira task keys from the PR title and body
  const tasks = getTaskKeys(`${cleanedTitle}\n${pull.body}`);

  const hasTasks = tasks.length > 0;

  const isOpen = pull.state === 'open';
  const isDraft = pull.draft;
  const isReleasePR = cleanedTitle.includes('chore: bump versions') || cleanedTitle.includes('chore: release');

  let hasPreviewLabel = pull.labels.some(label => label.name === 'preview');

  if (!isReleasePR && hasTasks && !hasPreviewLabel && isOpen && !isDraft) {
    core.info(`🍑 PR #${issueNumber} has tasks but is missing the 'preview' label.`);

    // auto-add the preview label
    await github.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: ['preview'],
    });

    core.info(`Added 'preview' label to PR #${issueNumber}.`);

    hasPreviewLabel = true;
  }

  const isEligible = isOpen && !isDraft && hasPreviewLabel && !isReleasePR;

  core.info(
    `PR #${issueNumber} is ${isEligible ? 'eligible' : 'not eligible'} for preview deployment. PR is ${isOpen ? 'open' : 'closed'
    }, ${isDraft ? 'draft' : 'not draft'}, and has ${hasPreviewLabel ? 'the' : 'no'} 'preview' label.`,
  );

  core.setOutput('OK', isEligible ? 'true' : 'false');
};
