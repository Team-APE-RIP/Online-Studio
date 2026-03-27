import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { APP_LOCALES, type AppLocale } from "@team-ape-rip/shared";

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const requested = await requestLocale;
  const fallbackLocale: AppLocale = "zh-CN";

  const locale = hasLocale(APP_LOCALES, cookieLocale)
    ? cookieLocale
    : hasLocale(APP_LOCALES, requested)
      ? requested
      : fallbackLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});