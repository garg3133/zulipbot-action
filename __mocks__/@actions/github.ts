export const context = {
  issue: {
    owner: "octo-cat",
    repo: "helloworld",
  },
};

const mockGitHubApi = {
  issues: {
    listLabelsOnIssue: jest.fn(),
  },
  users: {
    getAuthenticated: jest.fn(),
  },
};

export const getOctokit = jest.fn().mockImplementation(() => mockGitHubApi);
