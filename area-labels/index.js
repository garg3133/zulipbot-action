const core = require("@actions/core");
const github = require("@actions/github");
const config = require("./clientConfig.js");
const areaLabel = require("./areaLabel.js");

const run = async () => {
  const client = await config.getClient();

  const context = github.context;
  if (
    context.eventName !== "issues" &&
    context.eventName !== "pull_request_target"
  )
    return;

  const payload = context.payload;
  if (payload.action === "labeled" || payload.action === "unlabeled") {
    areaLabel.run(client, payload);
  }
};


// Run the script
try {
  run();
} catch (error) {
  core.setFailed(error.message);
}
