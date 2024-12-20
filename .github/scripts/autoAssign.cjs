/**
 * Assign a newly opened PR to its creator
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async ({ github, context, core }) => {
  if (context.payload.pull_request.user.login === 'github-actions[bot]') {
    core.info(
      `Skipping PR #${context.payload.pull_request.number} because it is a bot`,
    );

    return;
  }

  try {
    core.info(
      `Assigning PR #${context.payload.pull_request.number} to ${context.payload.pull_request.user.login}...`,
    );

    await github.rest.issues.addAssignees({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      assignees: [context.payload.pull_request.user.login],
    });
  } catch (error) {
    core.setFailed(error.message);
  }
};
