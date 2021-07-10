# commands-action

_commands-action_ allows the contributors to **self-assign** the issues they'd like to work on, without waiting for a maintainer to assign them the issues before they can start working on them. This not only helps the contributors to have the issues assigned to them faster, so they can start working on them instantly, but also helps reduce the work of maintainers of going through the issues and responding to all the assign requests.

Now, if you worry about the new contributors coming to your repository and claiming a dozen issues, which they don't plan to work on, or claiming some important/high priority issues and not doing anything, we have all amazing configurations in place for you. Not only can you set how many issues a new contributor can claim at once on your repository, you can also disallow them from claiming certain issues by putting certain labels on that issue (which you'd specify in the configuration file for the action). Or the other way around, you can have some labels in place which needs to be present on the issues for the new contributors to be able to claim them.

Next, if a contributor no longer wishes to work on an issue, they can also unassign themselves from the issue using a similar command.

**Note:** You can also have the contributors unassigned from the issues automatically, if the issue's been inactive for more than a specific period of time. Checkout [activity-action](../activity-action) for that.

Along with the self-assign or claim feature, this action also allows the contributors to add/remove certain labels on the issues and PRs (like adding a `needs review` label on a PR once it is ready for review), in a highly configurable way.

See the [sample-config](config/sample-config.yml) file for all the configurable options, for both the `assign` and `label` features.

# Commands

You can use the following 4 commands to perform different operations using the _commands-action_. Here, `username` refers to the username of the bot's GitHub account you'll be setting up in the [usage](#usage) section.

**@username claim** -- Assigns the issue to the commenter.  
**@username abandon** -- Unassigns the commenter from the issue.  
**@username add "label1" "label2"** -- Adds the mentioned labels to the issue or PR.  
**@username remove "label1" "label2"** -- Removes the mentioned labels from the issue or PR.

# Usage

### Create a GitHub account for the bot

Go to [github.com/join](https://github.com/join) and create a new account, which you'll be using as a bot account in your repository/organization while using _commands-action_ and other zulipbot-actions in your repository/organization.

Once you've created the account, go to _Settings > Developer settings > Personal access tokens > Generate new token_ and create a new token (with full `repo` and `admin:org` scopes) and save it somewhere. It will be required below while configuring the action in your project.

Personal access token allows the action to use your bot account for performing the tasks like issue triaging, commenting, etc. in your repository.

### Create a configuration file

Next, you need to set up a configration file for the action, where you'll specify the details like what features you'd like to use, out of all the features this action provides, and with what configurations.

You can add this configuration file anywhere in your repository, but we'd prefer you create this file at `.github/zulipbot-config/commands-action.yml`.

See the sample configuration file [here](config/sample-config.yml) with all possible configurations.

### Configure bot's access to your repository

The next step is to give the bot account you created earlier write permissions on your repository, so that the bot can perform the required actions like triaging, commenting, etc. in your repository. Follow the below mentioned two steps:

- Add the bot account as a collaborator in your repository (go to _Settings > Manage access > Invite teams or people_).
- Save the Personal access token you created earlier as a secret in your repository, so that it can be safely passed on to the action through the workflow file you'll create at the end. To save the personal access as a secret in your repository, go to _Settings > Secrets > New repository secret_ and add a new secret with `BOT_ACCESS_TOKEN` as name of the secret and the personal access token as value.

### Setting up custom templates (optional)

You can optionally also set up custom templates, according to your needs. Templates contains the messages which will be posted by the bot in the issues and PRs of your repository, as a response to the commands used there. These messages are generally posted if something goes wrong, like a contributor trying to claim an issue he/she is not allowed to claim, as a way to give feedback to the commenter.

The default templates can be found [here](templates/).

If you don't like the default templates or need some changes in them, you can create your own custom templates and put them in a separate directory in your repository (which we'd prefer you create at `.github/zulipbot-config/templates`). Make sure that the template files you are creating have the same name as the default templates, otherwise they won't be considered.

One more thing to note is that the words surrounded by the curly braces in the default templates are actually context variables, whose values are provided by the backend during render. For example, after the templates are rendered, `{commenter}` in the templates gets replaced by the actual username of the commenter. So, you can use these context variables in your custom templates as well, as you find suitable.

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
          # Relative path to the commands-action config file.
          config-file-path: .github/zulipbot-config/commands-action.yml
          # (Optional) Relative path to the directory containing custom templates.
          templates-dir-path: .github/zulipbot-config/templates
```

---

Congrats :tada: you're all set up now. Go ahead and execute a command by commenting on an issue or pull request.
