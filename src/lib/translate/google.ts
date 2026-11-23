import "server-only";

const endpoint = "https://translation.googleapis.com/language/translate/v2";

type GoogleResponse = {
  data?: {
    translations?: {
      translatedText: string;
      detectedSourceLanguage?: string;
    }[];
  };
  error?: { message?: string };
};

export type Translation = {
  text: string;
  detectedLanguage?: string;
};

export function translationEnabled() {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
}

export async function translateTexts(
  texts: string[],
  target: string,
): Promise<Translation[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("GOOGLE_TRANSLATE_API_KEY is not set.");
  if (texts.length === 0) return [];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
    body: JSON.stringify({ q: texts, target, format: "text" }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await response.json().catch(() => ({}))) as GoogleResponse;

  if (!response.ok || !body.data?.translations) {
    throw new Error(
      `Google Translate failed (${response.status}): ${body.error?.message ?? "no translations returned"}`,
    );
  }

  return body.data.translations.map((item) => ({
    text: item.translatedText,
    detectedLanguage: item.detectedSourceLanguage,
  }));
}
