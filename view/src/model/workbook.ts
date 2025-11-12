import type z from "zod";
import type { WorkbookSchema } from "../api/schema/schema";

export type Workbook = z.infer<typeof WorkbookSchema>;
