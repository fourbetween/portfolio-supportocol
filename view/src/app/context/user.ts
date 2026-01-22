import { createContext } from "@lit/context";
import type { User } from "../model/user";

export const userContext = createContext<User>(Symbol("user"));
