import type { components } from "../api/schema";

export type PermissionLevel = components["schemas"]["PermissionLevel"];

export function canPerform(
  level: PermissionLevel,
  isAuthenticated: boolean,
): boolean {
  if (level === "everyone") return true;
  if (level === "authenticated") return isAuthenticated;
  return false;
}
