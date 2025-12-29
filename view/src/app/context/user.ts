import { createContext } from "@lit/context";
import type { User } from "../../feature/identity/model/user";

export const userContext = createContext<User | null>(Symbol("user"));
