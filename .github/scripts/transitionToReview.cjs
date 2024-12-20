const { Comment } = require('./utils/comment.cjs');
const {
  getTaskKeys,
  addComment,
  transitionTask,
  getTaskStatus,
  getExistingComment,
} = require('./utils/jira.cjs');
const { getPullRequest } = require('./utils/github.cjs');

/**
 * Run when a PR is ready for review. Transition tasks to "In Review"
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 * @param {*} fetch The fetch function from the @actions/github package
 */
module.exports = async ({ github, context, core }, fetch) => {
  const { number: issueNumber } = context.issue;
  const { owner, repo } = context.repo;

  try {
    const pull = await getPullRequest(github, owner, repo, issueNumber);

    const isDraft = pull.draft;

    if (!pull || pull.base.ref.includes('main') || isDraft) {
      core.info(`Skipping PR #${issueNumber}`);
      return;
    }

    core.info(`Checking tasks in PR #${issueNumber} for transition to "In Review"...`);

    const cleanedTitle = pull.title.replace(`#${issueNumber}`, '');

    const tasks = getTaskKeys(`${cleanedTitle}\n${pull.body}`);

    core.info(`Found ${tasks.length} task(s) in the pull request. ${tasks.length > 0 ? `Tasks: ${tasks}` : ''}`);

    for (const task of tasks) {
      try {
        // Check current status before attempting transition
        const statusResponse = await getTaskStatus(task, fetch);

        if (!statusResponse.ok) {
          core.error(`Failed to get status for task ${task}. Status: ${statusResponse.status}`);
          continue;
        }

        const { fields: { status: { name: currentStatus } } } = await statusResponse.json();

        if (currentStatus.toLowerCase() === 'in review') {
          core.info(`Task ${task} is already in "In Review" status. Skipping transition...`);
          continue;
        }

        const existingComment = await getExistingComment(task, fetch);

        if (existingComment) {
          core.info(`Found an existing comment for task ${task} - skipping adding a new comment.`);
          continue;
        }

        const comment = new Comment();

        comment.paragraph(`PR ${issueNumber} is being reviewed!`);

        const transition = await transitionTask(task, 'IN_REVIEW', fetch);

        if (transition.status === 204) {
          core.info(`Transitioned task ${task} to "In Review"`);
        } else {
          core.info(`Failed to transition task ${task} to "In Review"! Response: ${transition.status}`);
        }

        const addCommentResponse = await addComment(task, comment.build(), fetch);

        if (addCommentResponse.status === 201) {
          core.info(`Added a comment to task ${task}`);
        } else {
          core.info(`Failed to add a comment to task ${task}! Response: ${addCommentResponse.status}`);
        }
      } catch (error) {
        core.error(`Error transitioning task ${task}: ${error.message}`);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
