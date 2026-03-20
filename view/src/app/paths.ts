import type { Router } from "@lit-labs/router";

export const paths = {
  marketing: {
    home: "/",
    howToUse: "/how-to-use",
  },
  learning: {
    dashboard: "/learning/discussions",
  },
  dialogue: {
    search: "/dialogue/search",
    item: "/dialogue/workspaces/:workspaceId/discussions/:discussionId",
  },
  workspace: {
    projects: "/workspace/projects",
    project: "/workspace/projects/:projectId",
  },
  identity: {
    account: "/identity/account",
    verifyEmail: "/identity/signup/verify-email",
    checkEmail: "/identity/check-email",
    requestPasswordReset: "/identity/password/reset-request",
    confirmPasswordReset: "/identity/password/reset",
  },
};

export const buildPath = (
  path: string,
  params?: Record<string, string>,
): string => {
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }
  }
  return path;
};

export const navigate = async (
  router: Router,
  path: string,
  params?: Record<string, string>,
) => {
  const builtPath = buildPath(path, params);
  const url = new URL(builtPath, window.location.origin);
  window.history.pushState({}, "", url.toString());
  await router.goto(url.pathname);
};

export const pathInFeature = (path: string): string => {
  const features = ["learning", "dialogue", "workspace", "identity"];
  for (const feature of features) {
    const prefix = "/" + feature + "/";
    if (path.startsWith(prefix)) {
      return path.substring(prefix.length);
    }
  }
  return path.startsWith("/") ? path.substring(1) : path;
};
