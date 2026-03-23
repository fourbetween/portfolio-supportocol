import { getLocale } from "../../../localization";
import type { components } from "../api/schema";

export type Locale = components["schemas"]["Locale"];

export function getCurrentLocale(): Locale {
  return getLocale() as Locale;
}
