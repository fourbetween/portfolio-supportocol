import { createContext } from "@lit/context";
import type { WorkspaceWithMember } from "../model/workspace";

export const workspaceContext = createContext<WorkspaceWithMember>(
  Symbol("workspace"),
);
