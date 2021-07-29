# activity-action

_activity-action_ keeps a track on all the open issues and pull requests in your repository.

If any issue is found to be inactive for more than a specific number of days (neither the issue nor the PRs linked to the issue have been updated for more than the specified days), it posts a reminder to the contributor assigned to that issue (by commenting on the issue), and automatically unassigns the contributor from the issue if no progress is made for a specific number of days even after the reminder.

# Usage

### Create a bot account on GitHub

Go to [github.com/join](https://github.com/join) and create a new account which you'll be using as a bot account in your repository/organization while using _activity-action_ and other zulipbot-actions in your repository/organization.

Once you've created the account, go to _Settings > Developer settings > Personal access tokens > Generate new token_ and create a new token (with full `repo` scope) and save it somewhere. It will be required below while configuring the action in your project.

Personal access token allows the action to use your bot account for performing the tasks like issue triaging, commenting, etc. in your repository.

### Configure bot's access to your repository

The next step is to give the bot account you just created _Write_ permissions on your repository, so that the bot can perform the required actions like triaging (unassigning a contributor from an issue), commenting on your repository. Follow the below mentioned two steps:

- Add the bot account as a collaborator in your repository (go to _Settings > Manage access > Invite teams or people_).
- Save the Personal access token you created earlier as a secret in your repository, so that it can be safely passed on to the action through the workflow file you'll create at the end. To save the personal access as a secret in your repository, go to _Settings > Secrets > New repository secret_ and add a new secret with `BOT_ACCESS_TOKEN` as name of the secret and the personal access token as value.

### Setting up custom templates

You can also set up custom templates, according to your needs. Templates contains the messages which will be posted by the bot in the issues and PRs of your repository, as comments.

The default templates can be found [here](templates/).

If you don't like the default templates or need some changes in them, you can create your own custom templates and put them in a separate directory in your repository (which we'd prefer you create at `.github/zulipbot-config/templates`). Make sure that the template files you are creating have the same name as the default templates, otherwise they won't be considered.

One more thing to note is that the words surrounded by the curly braces in the default templates are actually context variables, whose values are provided by the backend during render. For example, after the templates are rendered, `{commenter}` in the templates gets replaced by the actual username of the commenter. So, you can use these context variables in your custom templates as well, as you find suitable.

### Add action's workflow file

The final step in setting up the _activity-action_ in your repository is to add a workflow file (in `yaml` format) inside the `.github/workflows` directory of your repository, with the following content:

```yml
name: Activity Action

on:
  # Run the action every 12 hours.
  # More detauls about the schedule event and cron here:
  # https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule
  schedule:
    - cron: "0 0/12 * * *"

jobs:
  activity-action:
    runs-on: ubuntu-latest
    steps:
      - name: activity-action run
        uses: garg3133/zulipbot-action/areas-action@main
        with:
          token: ${{ secrets.BOT_ACCESS_TOKEN }}
          # Relative path to the directory containing custom templates.
          templates-dir-path: .github/zulipbot-config/templates
          # Label to prevent an issue from being checked by
          # activity-action, resulting in no warnings or unassignment
          # on that issue.
          skip_issue_with_label: "keep assigned"
          # Skip an issue from being checked by activity-action if any
          # pull request linked to that issue contains this label.
          skip_issue_with_pull_label: "needs review"
          # Number of days since an issue was last updated before it
          # is considered inactive, resulting in inactivity reminder.
          days_until_warning: 10
          # Number of days since an issue assignee was reminded to
          # work on their pending issue before the assignee is removed
          # from the issue due to inactivity.
          days_until_unassign: 4
```

---

Congrats :tada: you're all set up now. From now on, you wouldn't need to worry about an issue being assigned to a contributor forever, without anybody working on it.
