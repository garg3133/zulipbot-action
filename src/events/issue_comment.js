exports.run = function(payload) {
    // If event is fired in pull request.
    if(payload.pull_request) return;

    const action = payload.action;

    if (action === "created") {
        parse.call(this, payload);
    }
};

function parse(payload) {
    const data = payload.comment;
    const commenter = data.user.login;
    const body = data.body;
    const username = this.cfg.botName;

    if (commenter === username || !body) return;

    const prefix = RegExp(`@${username} +(\\w+)( +(--\\w+|"[^"]+"))*`, "g");
    const parsed = body.match(prefix);
    if (!parsed) return;
  
    parsed.forEach(command => {
      const codeBlocks = [`\`\`\`\r\n${command}\r\n\`\`\``, `\`${command}\``];
      if (codeBlocks.some(block => body.includes(block))) return;
      const [, keyword] = command.replace(/\s+/, " ").split(" ");
      const args = command.replace(/\s+/, " ").split(" ").slice(2).join(" ");
      const file = this.commands.get(keyword);
  
      if (file) {
        file.run.apply(this, [payload, commenter, args]);
      }
    });
}

// exports.getConfig = function () {

// };