# commands-action

_commands-action_ allows the contributors to **self-assign** the issues they'd like to work on, instead of waiting for a maintainer to assign them the issues, before they can start working on them. This not only helps the contributors to have the issue assigned to them faster, so they can start working on the issue at the same time, but also helps reduce the maintainer's work of going through the issues and assigning them to the contributors.

If the contributor no longer wishes to work on a issue, they can also unassign themselves from the issue using a similar command.

**Note:** You can also have the contributors unassigned from the issues automatically, if the issue's been inactive for more than a specific period of time. Checkout [activity-action](../activity-action) for that.

This action also allows the contributors to add/remove labels from the issues/PRs, in a restrictive manner. Like if some contributor would like a review on their PR, they can add a `needs review` label on the PR, so that other contributors who see their PR with the `needs review` label on the PRs page can also help review the PR.

# Commands

You can use the following 4 commands to perform different operation using the _commands-action_. Here, `username` refers to the username of the bot's GitHub account you'll be setting up in the [usage](#usage) section.

**@username claim** -- Assigns the issue to the commenter.  
**@username abandon** -- Unassigns the commenter from the issue.  
**@username add "label1" "label2"** -- Adds all the mentioned labels to the issue or PR (or the labels they're allowed to add).  
**@username remove "label1" "label2"** -- Removes all the mentioned labels from the issue or PR (or the labels they're allowed to remove).

# Usage

### Create a bot account on GitHub

Go to [github.com/join](https://github.com/join) and create a new account which you'll be using as a bot in your project/organization while using _commands-action_ and other zulipbot-actions in your project/organization.

Once you've created the account, go to _Settings > Developer settings > Personal access tokens > Generate new token_ and create a new token and save it somewhere. It will be required below while configuring the action in your project.

Personal access token allows the action to use your bot account while performing the tasks like issue triaging, commenting, etc. in your repository.

### Create a configuration file

Next, you need to set up a configration file for the action, where you'll specify the details like what features you'd like to use, out of all the features this action provides, and with what configuration.

You can add this configuration file anywhere in your repository, but we'ed prefer creating this file at `.github/zulipbot-config/areas-action.yml`.

**Sample Config File**

```yml
# If you don't want to use a feature, just don't
# mention it in the configuration below.

# Enable @claim and @abandon issue commands.
# @types:
#   true: Use with default config;
#   false: Don't use this command;
#   Or, provide config to use;
claim:
  # Maximum users who can claim a single issue.
  # Don't mention to use default config.
  # @default: 1
  max_assignees: 1
```

### Configure bot's access to your repository

The next step is to give the bot account you created earlier write permissions on your repository, so that the bot can perform the required actions like triaging, commenting, etc. in your repository. Follow the below mentioned two steps:

- Add the bot account as a collaborator in your repository (go to _Settings > Manage access > Invite teams or people_).
- Save the Personal access token you created earlier as a secret in your repository, so that it can be safely passed on to the action through the workflow file. To save the personal access as a secret in your repository, go to _Settings > Secrets > New repository secret_ and add a new secret with `BOT_ACCESS_TOKEN` as name of the secret and the personal access token as value.

### Add action's workflow file

The final step to setting up the _commands-action_ in your repository is to add a workflow file (in `yaml` format) inside the `.github/workflows` directory of your repository, with the following content:

```yml
name: Commands Action

on:
  # Run the action whenever a comment is added on a issue or PR.
	# (`issue_comment` event is triggered on PR comments as well.)
  issue_comment:
		types: created

jobs:
  commands-action:
    runs-on: ubuntu-latest
    steps:
      - name: Handle commands
        uses: garg3133/zulipbot-action/commands-action@main
        with:
          token: ${{ secrets.BOT_ACCESS_TOKEN }}
          # Relative path to the areas-action config file
          config-file-path: .github/zulipbot-config/areas-action.yml
					# Relative path to the directory containing custom templates
					templates-dir-path: .github/config/templates
```

Congrats :tada: you're all set up now. Go ahead and execute a command by commenting on an issue or a pull request.
