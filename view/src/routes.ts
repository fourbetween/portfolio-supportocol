import type { Router } from "@lit-labs/router";

export const routes = {
  front: "/",
  dashboard: "/dashboard",
  project: "/projects/:id",
  discussion: "/discussions/:id",
} as const;

export type RouteName = keyof typeof routes;

export type RouteParams = {
  front: Record<string, never>;
  dashboard: Record<string, never>;
  project: { id: string };
  discussion: { id: string };
};

export const buildPath = <T extends RouteName>(
  name: T,
  params?: RouteParams[T]
): string => {
  let path: string = routes[name];
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }
  }
  return path;
};

export const navigate = async <T extends RouteName>(
  router: Router,
  name: T,
  params?: RouteParams[T]
) => {
  const path = buildPath(name, params);
  await router.goto(path);
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.pathname = path;
  window.history.pushState({}, "", url.toString());
};
