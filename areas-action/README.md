# areas-action

_areas-action_ helps notify the teams in your GitHub organization whenever an issue or a PR is opened (and labeled with an `area-label`) in their _area_ of expertise, by subscribing them to that issue or PR.

_areas-action_ works by defining a few _areas_ labels in your repository and mapping each to the team that have an expertise in that area of the project, in the configuration file of the action.

Now, just try adding the appropriate labels on the issues and PRs, according to the area of project they are related to. This not only helps notify the teams of the issue or PR opened in their areas of expertise, **but also helps in organizing the issues and PRs in your repository into well-defined _areas_**, which not only makes it easier to keep track of the progress in a particuar area of the project but also helps the contributors easily find the issues which they might be interested in working on, just by filtering the issues according to their areas of interest.

Some good examples of area-labels can be `area: api`, `area: documentation`, `area: authentication`, `area: integration`, `area: refactoring`, etc.

# Usage

### Create a bot account on GitHub

Go to [github.com/join](https://github.com/join) and create a new account which you'll be using as a bot account in your repository/organization while using _areas-action_ and other zulipbot-actions in your repository/organization.

Once you've created the account, go to _Settings > Developer settings > Personal access tokens > Generate new token_ and create a new token (with full `repo` and `admin:org` scopes) and save it somewhere. It will be required below while configuring the action in your project.

Personal access token allows the action to use your bot account for performing the tasks like issue triaging, commenting, etc. in your repository.

### Create a configuration file

Next, you need to set up a configration file for the action, where you'll specify all the area-labels you'll be using in your project and the corresponding teams having an expertise in that area.

You can add this configuration file anywhere in your repository, but we'd prefer you create this file at `.github/zulipbot-config/areas-action.yml`.

See the sample configuration file [here](config/sample-config.yml) with all possible configurations.

Note: Multiple area-labels can map to the same team, but one area-label cannot map to multiple teams (area-labels must be unique in the configuration file).

### Configure bot's access to your repository

The next step is to give the bot account you created earlier _Write_ permissions on your repository, so that the bot can perform the required actions like labeling and editing issues/pull requests descriptions on your repository. Follow the below mentioned two steps:

- Add the bot account as a collaborator in your repository (go to _Settings > Manage access > Invite teams or people_).
- Save the Personal access token you created earlier as a secret in your repository, so that it can be safely passed on to the action through the workflow file you'll create at the end. To save the personal access as a secret in your repository, go to _Settings > Secrets > New repository secret_ and add a new secret with `BOT_ACCESS_TOKEN` as name of the secret and the personal access token as value.

### Add action's workflow file

The final step in setting up the _areas-action_ in your repository is to add a workflow file (in `yaml` format) inside the `.github/workflows` directory of your repository, with the following content:

```yml
name: Areas Action

on:
  # Run the action (to notify the teams) whenever a label is
  # added or removed from an issue.
  issues:
    types: [labeled, unlabeled]
  # Run the action (to notify the teams) whenever a label is
  # added or removed from a pull request.
  #
  # Run the action (to copy the labels from linked issues)
  # whenever a pull request is opened, edited (PR description)
  # or synchronized (commits are modified).
  # Using "edited" and "synchronize" is optional.
  pull_request_target:
    types: [labeled, unlabeled, opened, edited, synchronize]

jobs:
  areas-action:
    runs-on: ubuntu-latest
    steps:
      - name: areas-action run
        uses: garg3133/zulipbot-action/areas-action@main
        with:
          token: ${{ secrets.BOT_ACCESS_TOKEN }}
          # Relative path to the areas-action config file
          config-file-path: .github/zulipbot-config/areas-action.yml
```

---

Congrats :tada: you're all set up now. From now on, whenever you'll add an area-label to an issue or a PR in your repository, it will notify the corresponding teams, subscribing them to the issue/PR by CCing them into the description of the issue/PR.
