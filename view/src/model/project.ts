import type z from "zod";
import type { ProjectSchema } from "../api/schema/schema";

export type Project = z.infer<typeof ProjectSchema>;
