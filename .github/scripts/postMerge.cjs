const { Comment } = require('./utils/comment.cjs');
const { getPullRequest } = require('./utils/github.cjs');
const { addComment, transitionTask, getTaskKeys } = require('./utils/jira.cjs');

/**
 * Run when a PR is merged. Transition task to "Done" and add a comment
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 * @param {*} fetch The fetch function from the @actions/github package
 */
module.exports = async ({ github, context, core }, fetch) => {
  const { number: issueNumber } = context.issue;
  const { owner, repo } = context.repo;

  try {
    const pull = await getPullRequest(github, owner, repo, issueNumber);

    let transitionName;

    if (pull.base.ref.includes('main')) {
      transitionName = 'DONE';
    }

    if (!pull || !transitionName) {
      return;
    }

    core.info(`Transitioning tasks in PR #${issueNumber} to "${transitionName}"...`);

    const cleanedTitle = pull.title.replace(`#${issueNumber}`, '');

    const tasks = getTaskKeys(`${cleanedTitle}\n${pull.body}`);

    core.info(`Found ${tasks.length} task(s) in the pull request. ${tasks.length > 0 ? `Tasks: ${tasks}` : ''}`);

    for (const task of tasks) {
      try {
        const comment = new Comment();

        comment.heading(2, g => [g.text(`PR ${issueNumber} has been merged!`)]);

        const transitionResponse = await transitionTask(task, transitionName, fetch);

        if (transitionResponse.status === 204) {
          core.info(`Transitioned task ${task} to "${transitionName}"`);
        } else {
          core.info(`Failed to transition task ${task} to ${transitionName}! Response: ${transitionResponse.status}`);
        }

        const addCommentResponse = await addComment(task, comment.build(), fetch);

        if (addCommentResponse.status === 201) {
          core.info(`Added a comment to task ${task}`);
        } else {
          core.info(`Failed to add a comment to task ${task}! Response: ${addCommentResponse.status}`);
        }
      } catch (error) {
        core.warning(
          `Failed to transition task and add a comment! Error: ${error.message}`,
        );
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};
