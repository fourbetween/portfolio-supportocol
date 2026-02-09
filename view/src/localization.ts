import { configureLocalization } from "@lit/localize";
import { sourceLocale, targetLocales } from "./localize/locale-codes.ts";

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale: string) => import(`./localize/locales/${locale}.ts`),
});

const initLocale = async () => {
  const browserLanguage = navigator.language.split("-")[0];
  const isSupported =
    browserLanguage === sourceLocale ||
    (targetLocales as readonly string[]).includes(browserLanguage);
  const finalLocale = isSupported ? browserLanguage : sourceLocale;

  try {
    await setLocale(finalLocale);
  } catch (e) {
    console.error(`Failed to load locale: ${finalLocale}`, e);
  }
};

initLocale();
