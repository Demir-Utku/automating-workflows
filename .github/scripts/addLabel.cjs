const PRLabelMap = {
  feat: 'enhancement',
  refactor: 'refactor',
  fix: 'bug',
  chore: 'chore',
  ci: 'ci',
};

/**
 * Assign labels to a newly opened PR
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async ({ github, context, core }) => {
  const prTitle = context.payload.pull_request.title;
  let label;

  for (const [keyword, labelName] of Object.entries(PRLabelMap)) {
    if (prTitle.toLowerCase().includes(keyword)) {
      // if the PR title includes "chore: release", label it as a release
      if (keyword === 'chore' && prTitle.includes('chore: release')) {
        label = 'release';
        break;
      }

      label = labelName;
      break;
    }
  }

  if (label) {
    core.info(`Adding the "${label}" label to PR #${context.payload.pull_request.number}`);

    try {
      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.pull_request.number,
        labels: [label],
      });
    } catch (error) {
      core.setFailed(error.message);
    }
  }
};
