import { createContext } from "@lit/context";
import type { User } from "../auth";

export const userContext = createContext<User | null>(Symbol("user"));
