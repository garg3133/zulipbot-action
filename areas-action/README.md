# areas-action

_areas-action_ helps notify the teams in your GitHub organization whenever an issue or PR is opened (and labeled with an `area-label`) in their _area_ of expertise, by subscribing them to that issue or PR.

_areas-action_ works by defining a few _areas_ labels in your repository and mapping each to the team that have an expertise in that area of the project, in the configuration file of the action.

Now, just try adding the appropriate labels on the issues and PRs, according to the area of project they are related to. This not only helps notify the teams of the issue or PR opened in their areas of expertise, **but also helps in organizing the issues and PRs in your repository into well-defined _areas_**, which not only makes it easier to keep track of the progress of a particuar area of project but also helps the contributors easily find the issues they might be interested to work on, by filtering the issues according to their area of interest.

Some good examples of area-labels can be `area: api`, `area: documentation`, `area: authentication`, `area: integration`, `area: refactoring`, etc.

## Usage

### Create a bot account on GitHub

Go to [github.com/join](https://github.com/join) and create a new account which you'll be using as a bot in your project/organization while using _areas-action_ and other zulipbot-actions in your project/organization.

Once you've created the account, go to _Settings > Developer settings > Personal access tokens > Generate new token_ and create a new token and save it somewhere. It will be required below while configuring the action in your project.

Personal access token allows the action to gain access to your bot account and perform the required tasks like issue triaging, commenting, etc. in your project on behalf of the bot account.

### Create a configuration file

Next, you need to create a configration file for the action, where you'll specify all the area-labels you'll be using in your project and the corresponding teams having an expertise in that area.

You can create this configuration file anywhere in your repository, but we'ed prefer creating this file in `.github/zulipbot-config/areas-action.yml`.

**Sample Config File**

```yml
# A dictionary matching area labels (specified as keys) to
# team slugs (specified as values).
area_labels:
  "area: api": "server-api"
  "area: authentication": "server-authentication"
  "area: bots": "server-bots"

# Whether or not to automatically copy the area labels
# from an issue to the PRs linked to that issue (and thus,
# notify the respective area teams of that PR).
#
# Note: This only works if the PR is linked to an issue
# using the keywords (linked below) in the PR description
# or commit messages. It currently does not consider the
# issues linked manually due to the limitations of GitHub
# API.
# Keywords: https://help.github.com/articles/closing-issues-using-keywords/
copy_area_labels_to_pulls: true
```

Note: Multiple area-labels can map to the same team, but one area-label cannot map to multiple teams (area-labels must be unique in the configuration file).

### Configure bot's access in your repository

The next step is to give permissions of your repository to the bot account you created earlier, so that the bot can perform the required actions like triaging, commenting, etc. in your repository. Follow the two steps as mentioned below:

- Add the bot account as a collaborator in your repository (go to _Settings > Manage access > Invite teams or people_).
- Save the Personal access token you created earlier as a secret in your repository, so that it can be safely passed to the action through the workflow file. To save the PAT as a secret in your repository, go to _Settings > Secrets > New repository secret_ and add a new secret with `BOT_ACCESS_TOKEN` as name of the secret and the PAT as value.

### Add action's workflow file

The final step in setting up the _areas-action_ is to add a workflow file (in `yaml` format) inside the `.github/workflows` directory of your repository, with the following content:

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

Congrats :tada: you're all set up. From now on, whenever you'll add an area-label to an issue or a PR in your repository, it will notify the corresponding teams, subscribing them to the issue/PR by CCing them into the description of the issue/PR.
