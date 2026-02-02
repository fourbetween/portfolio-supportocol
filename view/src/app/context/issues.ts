import { createContext } from "@lit/context";
import type { Issue } from "../model/issue";

export const issuesContext = createContext<Issue[]>(Symbol("issues"));
