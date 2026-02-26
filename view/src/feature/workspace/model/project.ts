import type { components } from "../api/schema";

export type Project = components["schemas"]["Project"];

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return 1;
    if (!a.isDefault && b.isDefault) return -1;
    return 0;
  });
}
