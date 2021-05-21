const core = require("@actions/core");
const github = require("@actions/github");

export const getClient = () => {
  const token = core.getInput("token", { required: true });
  const client = github.getOctokit("", { auth: token });

  return client;
};

export const getClientLogin = async (client) => {
  const {
    status,
    data: { login },
  } = await client.users.getAuthenticated();

  if (status !== 200) {
    throw new Error(
      `Received unexpected API status code ${status} while requesting for bot's username.`
    );
  }

  return login;
};
