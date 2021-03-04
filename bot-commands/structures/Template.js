class Template {
  constructor(client, name, content) {
    /**
     * The client that instantiated this template
     * @type {Object}
     */
    this.client = client;

    /**
     * The name of this template
     * @type {string}
     */
    this.name = name;

    /**
     * The content of this template
     * @type {string}
     */
    this.content = content;
  }

  /**
   * Formats template content with values from a given context.
   *
   * @param {Object} context Context with names/values of variables to format
   * @return {String} Formatted template content.
   */

  format(context) {
    let content = this.content;
    for (const variable of Object.entries(context)) {
      const [expression, value] = variable;
      content = content.replace(new RegExp(`{${expression}}`, "g"), value);
    }

    return content;
  }
}

module.exports = Template;
