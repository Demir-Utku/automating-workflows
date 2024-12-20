/**
 * @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = function ({ context, core }) {
  // the ref is the current branch name
  let ref = context.ref.split('/')[2];

  if (context.eventName === 'workflow_run') {
    core.info('Using the build mode from the workflow run event: preprod');

    // if the event is a workflow run, the ref is preprod, so we can target our preprod environment for the update
    ref = 'preprod';
  } else {
    core.info(`Determining the build mode from the branch name: ${ref}`);
  }

  const buildMode = getBuildMode(ref);
  const buildTag = getBuildTag(buildMode);

  core.setOutput('BUILD_MODE', buildMode);
  core.setOutput('BUILD_TAG', buildTag);
};

/**
 * Get the build mode from the branch name.
 *
 * @param ref {string} - The branch name.
 * @returns {'dev' | 'preprod' | 'production'} - The build mode.
 */
function getBuildMode(ref) {
  if (ref.includes('dev')) {
    return 'dev';
  }

  if (ref.includes('preprod') || ref.includes('release')) {
    return 'preprod';
  }

  return 'production';
}

/**
 * Get the build tag from the branch name.
 *
 * @param mode {'dev' | 'preprod' | 'production'} - The build mode.
 * @returns {'dev' | 'preprod' | 'main'} - The build tag.
 */
function getBuildTag(mode) {
  if (mode === 'production') {
    return 'main';
  }

  return mode;
}
