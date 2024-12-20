const { Comment } = require('./comment.cjs');

/**
 * @param previewURL {string} - The URL of the preview deployment.
 * @returns {Promise<object>} A comment object.
 */
module.exports = async previewURL => {
  const comment = new Comment();

  comment
    .heading(2, g => [g.link('Preview URL', previewURL)])
    .paragraph('<!-- This comment was generated automatically -->');

  return comment.build();
};
