import type { Router } from "@lit-labs/router";
import { createContext } from "@lit/context";

export const routerContext = createContext<Router>(Symbol("router"));
