import type { Router } from "@lit-labs/router";

export const routes = {
  front: "/",
  dashboard: "/dashboard",
  project_item: "/projects/:id",
  discussion_list: "/discussions",
  discussion_item: "/discussions/:id",
  discussion_new: "/discussions/new",
} as const;

export type RouteName = keyof typeof routes;

export type RouteParams = {
  front: Record<string, never>;
  dashboard: Record<string, never>;
  project_item: { id: string };
  discussion_list: Record<string, never>;
  discussion_item: { id: string };
  discussion_new: Record<string, never>;
};

export const buildPath = (
  name: RouteName,
  params?: RouteParams[RouteName]
): string => {
  let path: string = routes[name];
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }
  }
  return path;
};

export const navigate = async (
  router: Router,
  name: RouteName,
  params?: RouteParams[RouteName]
) => {
  const path = buildPath(name, params);
  await router.goto(path);
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.pathname = path;
  window.history.pushState({}, "", url.toString());
};
