import "server-only";

export async function sendSms(to: string, text: string) {
  if (process.env.NODE_ENV === "development") {
    console.info(`SMS test mode, not sent. To ${to}: ${text}`);
  } else {
    console.info(
      `SMS test mode: a ${text.length}-character SMS to a tailor was not sent, because no SMS provider is set up yet.`,
    );
  }
  return false;
}
