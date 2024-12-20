/**
 * Run when a PR is merged. Perform artifact cleanup associated with the PR
 *
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async ({ github, context, core }) => {
  const { number: prNumber } = context.issue;
  const { owner, repo } = context.repo;

  core.info(`Cleaning up the artifacts for pull request #${prNumber} ... 🧹`);

  try {
    const artifactName = `build-pr-${prNumber}`;

    // check if an artifacts exist for the pull request
    const existingArtifacts = await github.rest.actions.listArtifactsForRepo({
      owner,
      repo,
    });

    const artifacts = existingArtifacts.data.artifacts.filter(artifact => artifact.name.includes(artifactName));

    if (artifacts.length) {
      core.info(`Found an artifact for pull request #${prNumber}!`);

      for (const artifact of artifacts) {
        await github.rest.actions.deleteArtifact({
          owner: context.repo.owner,
          repo: context.repo.repo,
          artifact_id: artifact.id,
        });
      }

      core.info(`Cleaned up artifacts for pull request #${prNumber}.`);
    } else {
      core.info(`Did not find an artifact for pull request #${prNumber}.`);
    }
  } catch (error) {
    core.setFailed(`Failed to clean up artifacts for pull request #${prNumber}. Error message: ${error.message}`);
  }
};
