const TransitionMap = {
  TO_DO: 11,
  IN_PROGRESS: 21,
  IN_REVIEW: 2,
  DONE: 31,
};

/**
 * @typedef {'TO_DO'|'IN_PROGRESS'|'IN_REVIEW'|'DONE'} TransitionName
 */

const COMMENT_IDENTIFIER = '<!-- This comment was generated automatically -->';

/**
 * Transition a Jira task to a new status
 *
 * @param taskId {string} - Jira task ID
 * @param transitionName {TransitionName} - Jira transition Name
 * @param fetch - fetch function to use
 * @returns {Promise<Response>} - Jira API response
 */
function transitionTask(taskId, transitionName, fetch) {
  const url = getJiraURL(`/issue/${taskId}/transitions`);

  const body = JSON.stringify({
    transition: {
      id: TransitionMap[transitionName],
    },
  });

  const options = {
    method: 'POST',
    headers: getHeaders(),
    body,
  };

  return fetch(url, options);
}

function getTaskStatus(taskId, fetch) {
  const url = getJiraURL(`/issue/${taskId}`);

  const options = {
    method: 'GET',
    headers: getHeaders(),
  };

  return fetch(url, options);
}

function addComment(taskId, comment, fetch) {
  const url = getJiraURL(`/issue/${taskId}/comment`);

  const body = JSON.stringify({
    body: comment,
  });

  const options = {
    method: 'POST',
    headers: getHeaders(),
    body,
  };

  return fetch(url, options);
}

function updateComment(taskId, commentId, comment, fetch) {
  const url = getJiraURL(`/issue/${taskId}/comment/${commentId}`);

  const body = JSON.stringify({
    body: comment,
  });

  const options = {
    method: 'PUT',
    headers: getHeaders(),
    body,
  };

  return fetch(url, options);
}

function getComments(taskId, fetch) {
  const url = getJiraURL(`/issue/${taskId}/comment`);

  const options = {
    method: 'GET',
    headers: getHeaders(),
  };

  return fetch(url, options);
}

function getTaskKeys(markdown) {
  const tasks = new Set();

  // AW-1234
  const taskPattern = /\b(AW-\d+)\b/g;

  let match;

  for (match = taskPattern.exec(markdown); match !== null; match = taskPattern.exec(markdown)) {
    tasks.add(match[1]);
  }

  return Array.from(tasks);
}

async function getExistingComment(taskId, fetch) {
  const { comments } = await getComments(taskId, fetch).then(response => response.json());

  return comments.find(c => {
    const paragraphs = c.body.content.filter(ct => ct.type === 'paragraph');
    return paragraphs.some(p => p.content.some(c => c.text?.includes(COMMENT_IDENTIFIER)));
  });
}

function getHeaders() {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_USER}:${process.env.JIRA_PASSWORD}`).toString('base64')}`,
  };
}

function getJiraURL(path = '') {
  return `https://utkudemir.atlassian.net/rest/api/3/${path}`;
}

module.exports = {
  transitionTask,
  getComments,
  addComment,
  updateComment,
  getTaskKeys,
  getTaskStatus,
  getExistingComment,
};
