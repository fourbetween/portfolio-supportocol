import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Component schemas
export const IdSchema = z.string().min(26).max(26).openapi("id");

export const StatusSchema = z.enum(["draft", "published"]).openapi("status");

export const WorkbookSchema = z
  .object({
    id: IdSchema,
    title: z.string(),
    status: z.string(),
  })
  .openapi("workbook");

export const ErrorSchema = z
  .object({
    code: z.number().int().min(100).max(599),
    message: z.string(),
  })
  .openapi("error");
