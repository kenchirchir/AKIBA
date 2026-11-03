import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = "en";

  return {
    locale,
    timeZone: "Africa/Kigali",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
