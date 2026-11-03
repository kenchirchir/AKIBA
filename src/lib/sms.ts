import "server-only";

type SendResult = {
  SMSMessageData?: {
    Recipients?: { status?: string; statusCode?: number }[];
  };
};

function provider() {
  const username = process.env.AFRICASTALKING_USERNAME;
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  if (!username || !apiKey) return null;

  const domain =
    username === "sandbox"
      ? "api.sandbox.africastalking.com"
      : "api.africastalking.com";

  return {
    url: `https://${domain}/version1/messaging`,
    username,
    apiKey,
    senderId: process.env.AFRICASTALKING_SENDER_ID,
  };
}

function logTestMode(to: string, text: string) {
  if (process.env.NODE_ENV === "development") {
    console.info(`SMS test mode, not sent. To ${to}: ${text}`);
  } else {
    console.info(
      `SMS test mode: a ${text.length}-character SMS to a tailor was not sent, because no SMS provider is set up yet.`,
    );
  }
}

export async function sendSms(to: string, text: string) {
  const sms = provider();
  if (!sms) {
    logTestMode(to, text);
    return false;
  }

  const body = new URLSearchParams({
    username: sms.username,
    to,
    message: text,
  });
  if (sms.senderId) body.set("from", sms.senderId);

  try {
    const response = await fetch(sms.url, {
      method: "POST",
      headers: {
        apiKey: sms.apiKey,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      console.error(`Africa's Talking answered ${response.status}`);
      return false;
    }

    const result = (await response.json()) as SendResult;
    const recipient = result.SMSMessageData?.Recipients?.[0];
    if (recipient?.status !== "Success") {
      console.error(
        `The SMS was not accepted: ${recipient?.status ?? "no recipient"}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Could not reach Africa's Talking", error);
    return false;
  }
}
