const { getPullRequest } = require('./utils/github.cjs');
const { getComments, updateComment, addComment, getTaskKeys } = require('./utils/jira.cjs');
const { Comment } = require('./utils/comment.cjs');
const template = require('./utils/commentTemplate.cjs');

const COMMENT_IDENTIFIER = '<!-- This comment was generated automatically -->';

/**
 * Comment the preview URL on the PR and related Jira tasks.
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 * @param {*} fetch The fetch function from the @actions/github package
 */
module.exports = async ({ github, context, core }, fetch) => {
  const userName = context.actor;
  const { number: issueNumber } = context.issue;
  const { owner, repo } = context.repo;

  core.info(`Commenting Preview-URL for PR #${issueNumber}...`);

  let previewUrl = process.env.PREVIEW_URL;

  if (!previewUrl.includes('https://')) {
    previewUrl = `https://${previewUrl}`;
  }

  const msg = await template(previewUrl ?? '');

  try {
    const pull = await getPullRequest(github, owner, repo, issueNumber);

    if (!pull) {
      throw new Error(`Could not fetch PR #${issueNumber}. Please check if the PR exists and the token has sufficient permissions.`);
    }

    core.info('Commenting preview URL on Jira tasks...');

    const cleanedTitle = pull.title.replace(`#${issueNumber}`, '');

    const tasks = getTaskKeys(`${cleanedTitle}\n${pull.body}`);

    core.info(`Found ${tasks.length} task(s) in the pull request. ${tasks.length > 0 ? `Tasks: ${tasks}` : ''}`);

    for (const task of tasks) {
      try {
        const { comments } = await getComments(task, fetch).then(response => response.json());

        const existingComment = comments.find(c => {
          const paragraphs = c.body.content.filter(ct => ct.type === 'paragraph');
          return paragraphs.some(p => p.content.some(c => c.text?.includes(COMMENT_IDENTIFIER)));
        });

        let body = msg;

        if (existingComment) {
          core.info(`Found an existing comment for task ${task}`);

          body = new Comment(msg.content)
            .paragraph(
              `Updated the preview URL for this task. Last updated by ${userName} at ${new Date().toLocaleString(
                'en-US',
                { timeZone: 'Europe/Istanbul' },
              )}`,
            )
            .build();
        }

        core.info(`${existingComment ? 'updating' : 'adding'} a comment for task ${task}...`);

        const commentResponse = await (existingComment
          ? updateComment(task, existingComment.id, body, fetch)
          : addComment(task, body, fetch));

        if (commentResponse.status === 201 || commentResponse.status === 200) {
          core.info(`${existingComment ? 'updated' : 'added'} a comment for task ${task}`);
        } else {
          core.info(
            `Failed to ${existingComment ? 'update' : 'add'} a comment for task ${task}! Response: ${commentResponse.status
            }`,
          );
        }
      } catch (error) {
        core.warning(`Failed to add/update a comment for task ${task}! Error: ${error.message}`);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};
