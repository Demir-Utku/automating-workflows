async function getPullRequest(github, owner, repo, pullNumber) {
  const { data: pull } = await github.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return pull;
}

module.exports = {
  getPullRequest,
};
