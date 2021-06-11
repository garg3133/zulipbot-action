# zulipbot-action

zulipbot-action lets you use the features of [zulipbot](https://github.com/zulip/zulipbot), with the ease of just adding a few workflow files in your repository.

This project divides the features of Zulipbot into 4 actions, namely, `commands-action`, `areas-action`, `activity-action` and `pulls-action`.

## [commands-action](commands-action)

_commands-action_ allows the contributors to self-assign an issue they are interested to work on and start working on it on the go, without the need of waiting for a maintainer to assign them the issue, before they can start working on it. Not only this, it also allows the contributors to _abandon_ an issue, if they no longer wish to work on it, and add/remove labels on issues/PRs (with some restrictions).

## [areas-action](areas-action)

_areas-action_ helps notify the teams in your GitHub organization whenever a new issue or PR is opened in their _areas_ of expertise, in a repository where areas-action is being used, by subscribing them to that issue or PR.

## [activity-action](activity-action)

_activity-action_ keeps a track on all the open issues and pull requests of a repository.

If an issue is found to be inactive for more than a specific number of days (neither the issue nor the PRs linked to the issue have been updated for more than the specified days), it posts a reminder to the contributor assigned to that issue (by commenting on the issue), and automatically unassigns the contributor from the issue if no progress is made for a specific number of days even after the reminder.

## [pulls-action](pulls-action)

_pulls-action_ provides a bunch of features to improve the overall workflow for both the maintainers and the contributors while working with PRs.

It helps maintainers in prioritizing the PRs to review by labelling each PR with a `size_label` according to the size of the PR (number of lines changed in the PR), which gives a rough idea on how much time it might take to review the PR. It also allows maintainers to automatically copy certain labels (as specified in the configuration file) to a Pull Request from the issue linked to the PR.

Along with this, it also provides a feature to notify the contributor working on a PR whenever a merge conflict occur on the PR, so that they can resolve it as soons as it occur.

---

All the features provided by the actions above are deactivated by default. This allows users to activate and write configuration for only those features that they want to use, and just leave the rest.
