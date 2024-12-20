class Block {
  /**
   * @param {Array<Heading | Paragraph | Blockquote | Link | Text>} contents - The array of content items to be included in the block.
   */
  constructor(contents) {
    this.contents = contents;
  }

  build() {
    return {
      type: this.constructor.name.toLowerCase(),
      content: this.contents.map(content => content.build()),
    };
  }
}

class Heading extends Block {
  /**
   * @param {number} level - The heading level (1-6).
   * @param {Array<Link | Text>} contents - The array of content items (Text or Link objects) to be included in the heading.
   */
  constructor(level, contents) {
    super(contents);
    this.level = level;
  }

  build() {
    const result = super.build();
    result.attrs = { level: this.level };
    return result;
  }
}

class Text {
  /**
   * @param {string} text - The text content.
   * @param {Array<Mark>} marks - The array of Mark objects to be applied to the text.
   */
  constructor(text, marks = []) {
    this.text = text;
    this.marks = marks;
  }

  build() {
    const textObj = {
      type: 'text',
      text: this.text,
    };

    if (this.marks.length > 0) {
      textObj.marks = this.marks.map(mark => mark.build());
    }

    return textObj;
  }
}

class Link extends Text {
  /**
   * @param {string} text - The link text.
   * @param {string} href - The link URL.
   */
  constructor(text, href) {
    super(text, [new Mark('link', { href })]);
  }
}

class Paragraph extends Block { }

/**
 * @typedef {'code' | 'em' | 'link' | 'strike' | 'strong' | 'subsup' | 'textColor' | 'underline'} MarkType
 */

class Mark {
  /**
   * @param {MarkType} type - The mark type.
   * @param {object} [attrs] - The mark attributes.
   */
  constructor(type, attrs = {}) {
    this.type = type;
    this.attrs = attrs;
  }

  build() {
    const markObj = {
      type: this.type,
    };

    if (Object.keys(this.attrs).length > 0) {
      markObj.attrs = this.attrs;
    }

    return markObj;
  }
}

class Comment {
  /**
   * @param content {Array}
   */
  constructor(content = []) {
    this.body = {
      type: 'doc',
      version: 1,
      content,
    };

    this.blockGenerator = new BlockGenerator();
  }

  /**
   * Add a heading to the comment.
   *
   * @param {number} level - The heading level (1-6).
   * @param {((generator: BlockGenerator) => Array<Link | Text>) | string} elementGenerator - A function that returns the array of content items (Text or Link objects) to be included in the heading.
   * @return {Comment} The Comment object, to allow for method chaining.
   */
  heading(level, elementGenerator) {
    if (typeof elementGenerator === 'string') {
      this.body.content.push(this.blockGenerator.heading(level, [this.blockGenerator.text(elementGenerator)]).build());
      return this;
    }

    this.body.content.push(this.blockGenerator.heading(level, elementGenerator(this.blockGenerator)).build());
    return this;
  }

  /**
   * Add a paragraph to the comment.
   *
   * @param {((generator: BlockGenerator) => Array<Link | Text>) | string} elementGenerator - A function that returns the array of content items (Text or Link objects) to be included in the paragraph.
   * @return {Comment} The Comment object, to allow for method chaining.
   */
  paragraph(elementGenerator) {
    if (typeof elementGenerator === 'string') {
      this.body.content.push(this.blockGenerator.paragraph([this.blockGenerator.text(elementGenerator)]).build());
      return this;
    }

    this.body.content.push(this.blockGenerator.paragraph(elementGenerator(this.blockGenerator)).build());
    return this;
  }

  build() {
    return this.body;
  }

  toMarkdown() {
    return this.body.content
      .map(block => {
        switch (block.type) {
          case 'heading':
            return `${'#'.repeat(block.attrs.level)} ${block.content[0].text}`;
          case 'paragraph':
            return block.content
              .map(content => {
                if (content.type === 'text') {
                  if (content.marks && content.marks[0].type === 'link') {
                    return `[${content.text}](${content.marks[0].attrs.href})`;
                  }
                  return content.text;
                }
                return '';
              })
              .join(' ');
          default:
            return '';
        }
      })
      .join('\n\n');
  }
}

class BlockGenerator {
  /**
   * Generate a heading object.
   *
   * @param level {number} - The heading level (1-6).
   * @param contents {Array<Link | Text>} - The array of content items (Text or Link objects) to be included in the heading.
   * @returns {Heading} - The heading object.
   */
  heading(level, contents) {
    return new Heading(level, contents);
  }

  /**
   * Generate a text object.
   *
   * @param text {string} - The text content.
   * @param [marks] {Array<Mark>} - The array of Mark objects to be applied to the text.
   * @returns {Text} - The text object.
   */
  text(text, marks) {
    return new Text(text, marks);
  }

  /**
   * Generate a link object.
   *
   * @param text
   * @param href
   * @returns {Link} - The link object.
   */
  link(text, href) {
    return new Link(text, href);
  }

  /**
   * Generate a paragraph object.
   *
   * @param contents {Array<Text | Link>} - The array of content items (Text or Link objects) to be included in the paragraph.
   * @returns {Paragraph} - The paragraph object.
   */
  paragraph(contents) {
    return new Paragraph(contents);
  }

  /**
   * Generate a mark object.
   *
   * @param type {MarkType} - The mark type.
   * @param [attrs] {Object} - The mark attributes.
   * @returns {Mark} - The mark object.
   */
  mark(type, attrs) {
    return new Mark(type, attrs);
  }
}

module.exports = {
  Comment,
  BlockGenerator,
};
