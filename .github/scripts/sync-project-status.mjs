import { readFile } from "node:fs/promises";

const GITHUB_API_URL = "https://api.github.com/graphql";
const LINEAR_API_URL = "https://api.linear.app/graphql";
const STATUS_NAMES = {
  todo: "Todo",
  inProgress: "In Progress",
  inReview: "In Review",
  done: "Done",
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  const projectWriteToken = process.env.GH_PROJECT_TOKEN;
  const githubReadToken = process.env.GITHUB_TOKEN || projectWriteToken;
  const repository = process.env.GITHUB_REPOSITORY;
  const eventName = process.env.GITHUB_EVENT_NAME;
  const event = await readGitHubEvent();

  if (!repository?.includes("/")) {
    throw new Error("GITHUB_REPOSITORY is missing or invalid.");
  }

  if (!projectWriteToken) {
    if (isForkPullRequest({ eventName, event, repository })) {
      console.log(
        "Skipping project sync for fork pull request because GH_PROJECT_TOKEN is unavailable.",
      );
      return;
    }

    throw new Error(
      "GH_PROJECT_TOKEN is required to sync GitHub Project status. Configure it as a repository Actions secret with GitHub Projects write access.",
    );
  }

  const [repoOwner, repoName] = repository.split("/");
  const projectMeta = await getProjectMeta({
    token: projectWriteToken,
    owner: process.env.PROJECT_OWNER || repoOwner,
    ownerType: process.env.PROJECT_OWNER_TYPE || "user",
    projectNumber: Number(process.env.PROJECT_NUMBER || "0"),
    statusFieldName: process.env.PROJECT_STATUS_FIELD || "Status",
  });

  const workItems = await getWorkItems({
    repoOwner,
    repoName,
    token: githubReadToken,
    eventName,
    event,
  });

  if (workItems.length === 0) {
    console.log("No project items to sync for this event.");
    return;
  }

  for (const item of workItems) {
    const projectItemId = await ensureProjectItem({
      token: projectWriteToken,
      projectId: projectMeta.id,
      contentId: item.nodeId,
    });

    const linearStatus = await getLinearStatus(item);
    const statusName = linearStatus || inferGitHubStatus(item);

    if (!statusName) {
      console.log(`Skipping ${item.kind} #${item.number}: no target status.`);
      continue;
    }

    const optionId = projectMeta.statusOptions.get(statusName);

    if (!optionId) {
      console.log(
        `Skipping ${item.kind} #${item.number}: project status option "${statusName}" does not exist.`,
      );
      continue;
    }

    await updateProjectStatus({
      token: projectWriteToken,
      projectId: projectMeta.id,
      itemId: projectItemId,
      fieldId: projectMeta.statusFieldId,
      optionId,
    });

    console.log(
      `Synced ${item.kind} #${item.number} to project status "${statusName}".`,
    );
  }
}

async function getWorkItems({ repoOwner, repoName, token, eventName, event }) {
  if (eventName === "issues" && event?.issue) {
    return [normalizeIssue(event.issue)];
  }

  if (eventName === "pull_request" && event?.pull_request) {
    return [normalizePullRequest(event.pull_request)];
  }

  const [issues, pullRequests] = await Promise.all([
    githubRestPaginated(
      `/repos/${repoOwner}/${repoName}/issues?state=all&per_page=100`,
      token,
    ),
    githubRestPaginated(
      `/repos/${repoOwner}/${repoName}/pulls?state=all&per_page=100`,
      token,
    ),
  ]);

  const normalizedIssues = issues
    .filter((issue) => !issue.pull_request)
    .map(normalizeIssue);
  const normalizedPullRequests = pullRequests.map(normalizePullRequest);

  return [...normalizedIssues, ...normalizedPullRequests];
}

function isForkPullRequest({ eventName, event, repository }) {
  if (eventName !== "pull_request" || !event?.pull_request) {
    return false;
  }

  return event.pull_request.head?.repo?.full_name !== repository;
}

async function readGitHubEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath) {
    return null;
  }

  const raw = await readFile(eventPath, "utf8");
  return JSON.parse(raw);
}

function normalizeIssue(issue) {
  return {
    kind: "issue",
    number: issue.number,
    nodeId: issue.node_id,
    title: issue.title || "",
    body: issue.body || "",
    state: issue.state || "open",
    draft: false,
    merged: false,
    headRef: "",
  };
}

function normalizePullRequest(pr) {
  return {
    kind: "pull_request",
    number: pr.number,
    nodeId: pr.node_id,
    title: pr.title || "",
    body: pr.body || "",
    state: pr.state || "open",
    draft: Boolean(pr.draft),
    merged: Boolean(pr.merged_at || pr.merged),
    headRef: pr.head?.ref || "",
  };
}

function inferGitHubStatus(item) {
  if (item.kind === "pull_request") {
    if (item.merged) {
      return STATUS_NAMES.done;
    }

    if (item.state === "closed") {
      return null;
    }

    return item.draft ? STATUS_NAMES.inProgress : STATUS_NAMES.inReview;
  }

  if (item.state === "closed") {
    return STATUS_NAMES.done;
  }

  return STATUS_NAMES.todo;
}

async function getLinearStatus(item) {
  const linearApiKey = process.env.LINEAR_API_KEY;
  const identifier = extractLinearIdentifier(item);

  if (!linearApiKey || !identifier) {
    return null;
  }

  const response = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${linearApiKey}`,
    },
    body: JSON.stringify({
      query: `
        query IssueStatus($id: String!) {
          issue(id: $id) {
            identifier
            state {
              name
              type
            }
          }
        }
      `,
      variables: { id: identifier },
    }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    console.log(
      `Linear lookup failed for ${identifier}; falling back to GitHub status.`,
    );
    return null;
  }

  const state = payload.data?.issue?.state;

  if (!state) {
    return null;
  }

  return mapLinearStateToProjectStatus(state);
}

function extractLinearIdentifier(item) {
  const match = `${item.title}\n${item.body}\n${item.headRef}`.match(
    /\b[A-Z][A-Z0-9]+-\d+\b/,
  );

  return match?.[0] ?? null;
}

function mapLinearStateToProjectStatus(state) {
  const name = String(state.name || "").toLowerCase();
  const type = String(state.type || "").toLowerCase();

  if (type === "completed" || type === "canceled") {
    return STATUS_NAMES.done;
  }

  if (name.includes("review")) {
    return STATUS_NAMES.inReview;
  }

  if (type === "started") {
    return STATUS_NAMES.inProgress;
  }

  return STATUS_NAMES.todo;
}

async function getProjectMeta({
  token,
  owner,
  ownerType,
  projectNumber,
  statusFieldName,
}) {
  if (!projectNumber) {
    throw new Error("PROJECT_NUMBER is required.");
  }

  const ownerSelection =
    ownerType === "organization"
      ? "organization(login: $owner)"
      : "user(login: $owner)";

  const payload = await githubGraphQL(
    `
      query ProjectMeta($owner: String!, $number: Int!) {
        ${ownerSelection} {
          projectV2(number: $number) {
            id
            fields(first: 50) {
              nodes {
                ... on ProjectV2FieldCommon {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
    { owner, number: projectNumber },
    token,
  );

  const project =
    payload.data?.user?.projectV2 || payload.data?.organization?.projectV2;

  if (!project) {
    throw new Error(
      `Could not load GitHub Project #${projectNumber} for ${owner}.`,
    );
  }

  const statusField = project.fields.nodes.find(
    (field) => field.name === statusFieldName,
  );

  if (!statusField?.options) {
    throw new Error(`GitHub Project field "${statusFieldName}" was not found.`);
  }

  return {
    id: project.id,
    statusFieldId: statusField.id,
    statusOptions: new Map(
      statusField.options.map((option) => [option.name, option.id]),
    ),
  };
}

async function ensureProjectItem({ token, projectId, contentId }) {
  const existingItemId = await getProjectItemId({ token, projectId, contentId });

  if (existingItemId) {
    return existingItemId;
  }

  const payload = await githubGraphQL(
    `
      mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item {
            id
          }
        }
      }
    `,
    { projectId, contentId },
    token,
  );

  return payload.data.addProjectV2ItemById.item.id;
}

async function getProjectItemId({ token, projectId, contentId }) {
  const payload = await githubGraphQL(
    `
      query ProjectItem($contentId: ID!) {
        node(id: $contentId) {
          ... on Issue {
            projectItems(first: 20) {
              nodes {
                id
                project {
                  id
                }
              }
            }
          }
          ... on PullRequest {
            projectItems(first: 20) {
              nodes {
                id
                project {
                  id
                }
              }
            }
          }
        }
      }
    `,
    { contentId },
    token,
  );

  const items = payload.data?.node?.projectItems?.nodes || [];
  return items.find((item) => item.project?.id === projectId)?.id ?? null;
}

async function updateProjectStatus({
  token,
  projectId,
  itemId,
  fieldId,
  optionId,
}) {
  await githubGraphQL(
    `
      mutation UpdateProjectStatus(
        $projectId: ID!
        $itemId: ID!
        $fieldId: ID!
        $optionId: String!
      ) {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: { singleSelectOptionId: $optionId }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }
    `,
    { projectId, itemId, fieldId, optionId },
    token,
  );
}

async function githubGraphQL(query, variables, token) {
  const response = await fetch(GITHUB_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    throw new Error(
      `GitHub GraphQL request failed: ${JSON.stringify(
        payload.errors || payload,
      )}`,
    );
  }

  return payload;
}

async function githubRest(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      `GitHub REST request failed: ${response.status} ${JSON.stringify(payload)}`,
    );
  }

  return payload;
}

async function githubRestPaginated(path, token) {
  const items = [];
  let page = 1;

  while (true) {
    const url = new URL(path, "https://api.github.com");
    url.searchParams.set("page", String(page));

    const payload = await githubRest(
      `${url.pathname}${url.search}`,
      token,
    );

    items.push(...payload);

    if (payload.length < 100) {
      return items;
    }

    page += 1;
  }
}
