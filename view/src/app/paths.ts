import type { Router } from "@lit-labs/router";

export const paths = {
  marketing: {
    home: "/",
  },
  learning: {
    dashboard: "/learning/discussions",
  },
  dialogue: {
    search: "/dialogue/search",
    // /dialogue/:id にすると /learning/discussions への遷移時に、
    // :id として discussions が解釈されてしまう問題があるため、 /dialogue/discussions/:id としている
    item: "/dialogue/discussions/:id",
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
  const buildedPath = buildPath(path, params);
  await router.goto(buildedPath);
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.pathname = buildedPath;
  window.history.pushState({}, "", url.toString());
};

export const pathInFeature = (path: string): string => {
  const features = ["learning", "dialogue"];
  for (const feature of features) {
    const prefix = "/" + feature + "/";
    if (path.startsWith(prefix)) {
      return path.substring(prefix.length);
    }
  }
  return path.startsWith("/") ? path.substring(1) : path;
};
