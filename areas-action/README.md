# areas-action

_areas-action_ helps notify the teams in your GitHub organization whenever an issue or PR is opened (and labeled with an `area-label`) in their _areas_ of expertise, by subscribing them to that issue or PR.

_areas-action_ works by defining a few _areas_ labels in your repository and mapping each to the team that have an expertise in that area of the project, in the configuration file of the action. ([Sample config file](config/config-example.yml))

Now, just try adding the appropriate labels on the issues and PRs, according to the area of project they are related to. This not only helps notify the teams of the issue or PR opened in their areas of experties, **but also helps organize the issues and PRs of the repository into well-defined _areas_ of project**, which not only makes it easier to keep track of the progress on a particuar area of project but also helps the contributors easily find the issues they might be interested to work on, by filtering the issues according to the areas.

Some good examples of area-labels might be `area: api`, `area-documentation`, `area-authentication`, `area: integration`, `area: refactoring`, etc.

Note: Multiple area-labels can correspond to the same team, but one area-label cannot correspond to multiple teams (area-labels must be unique in the configuration file).

## Usage

### Create a bot account on GitHub

Go to [github.com/join](https://github.com/join) and create a new account which you'll be using as a bot in your project/organization while using _areas-action_ and other zulipbot-actions in your project/organization.

Once you've created the account, go to _Settings > Developer settings > Personal access tokens > Generate new token_ and create a new token and save it somewhere. It will be required below while configuring the action in your project.

Personal access token allows the action gain access to your bot account and perform tasks like issue triaging, commenting, etc. on behalf of the bot.

### Create a configuration file

Next, you need to create a configration file for the action, where you'll specify all the area-labels you'll be using in your project and the corresponding teams having an expertise in that area.

You can create this configuration file anywhere in your repository, but we'ed prefer creating this file in `.github/zulipbot-config/areas-action.yml`.

**Sample Config File**

```yml
# A dictionary matching labels (specified as keys) to
# team slugs (specified as values).
area_labels:
  "area: api": "server-api"
  "area: authentication": "server-authentication"
  "area: bots": "server-bots"
```

### Configure bot's access in your repository

The next step is to give permissions to the bot account you created earlier, in your repository, so that the bot can perform required actions like triaging, commenting, etc. in your repository.

- Add the bot account as a collaborator on your repository.
- Save the Personal access token you created earlier as a secret in your repository, so that it can be safely passed to the action through the workflow file.

  To save the PAT as a secret in your repository, go to _Settings > Secrets > New repository secret_ and add a new secret with `BOT_ACCESS_TOKEN` as the name of the secret and the PAT as value.

### Add action's workflow file

The final step in setting up the _areas-action_ is to add a workflow file (in `yaml` format) inside the `.github/workflows` directory of your repository and add the following content:

```yml
name: Areas Action

on:
	# Run the action whenever a label is added
	# or removed from an issue or a pull request.
	issues:
		types: [labeled, unlabeled]
	pull_request_target:
		types: [labeled, unlabeled]

jobs:
	notify-teams:
		runs-on: ubuntu-latest
		steps:
			- name: Update issue/PR description
				uses: garg3133/zulipbot-action/areas-action@main
				with:
					token: ${{ secrets.BOT_ACCESS_TOKEN }}
					# Relative path to the areas-action config file
					config-file-path: .github/zulipbot-config/areas-action.yml

```

Congrats :tada: you're all set up. From now on, whenever you'll add an area-label to an issue or a PR in your repository, it will notify the corresponding teams, subscribing them to the issue or PR by CCing them into the description of the issue/PR.
