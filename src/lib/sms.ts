import "server-only";

type AfricasTalkingResult = {
  SMSMessageData?: {
    Recipients?: { status?: string; statusCode?: number }[];
  };
};

type PindoResult = {
  status?: string;
};

function pindo() {
  const token = process.env.PINDO_API_TOKEN;
  if (!token) return null;

  return {
    token,
    sender: process.env.PINDO_SENDER_ID || "PindoTest",
  };
}

function africasTalking() {
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

async function sendWithPindo(
  sms: NonNullable<ReturnType<typeof pindo>>,
  to: string,
  text: string,
) {
  try {
    const response = await fetch("https://api.pindo.io/v1/sms/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sms.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, text, sender: sms.sender }),
    });

    if (!response.ok) {
      const reason = await response.text().catch(() => "");
      console.error(
        `Pindo answered ${response.status}: ${reason.slice(0, 200)}`,
      );
      return false;
    }

    const result = (await response.json()) as PindoResult;
    if (result.status !== "sent") {
      console.error(
        `The SMS was not accepted by Pindo: ${result.status ?? "no status"}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Could not reach Pindo", error);
    return false;
  }
}

async function sendWithAfricasTalking(
  sms: NonNullable<ReturnType<typeof africasTalking>>,
  to: string,
  text: string,
) {
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

    const result = (await response.json()) as AfricasTalkingResult;
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

export async function sendSms(to: string, text: string) {
  const viaPindo = pindo();
  if (viaPindo) return sendWithPindo(viaPindo, to, text);

  const viaAfricasTalking = africasTalking();
  if (viaAfricasTalking)
    return sendWithAfricasTalking(viaAfricasTalking, to, text);

  logTestMode(to, text);
  return false;
}
