"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { AuthFormState } from "@/lib/auth/errors";

const waitSeconds = 60;

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ResendCode({
  action,
}: {
  action: () => Promise<AuthFormState>;
}) {
  const t = useTranslations("Verify");
  const errors = useTranslations("Auth.errors");
  const [seconds, setSeconds] = useState(waitSeconds);
  const [state, dispatch, pending] = useActionState(action, {});

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  function resend() {
    setSeconds(waitSeconds);
    startTransition(() => dispatch());
  }

  const failure = state.errors?.form;

  return (
    <div className="mt-6 text-sm text-secondary">
      <p>
        {t("noCode")}{" "}
        {seconds > 0 ? (
          <span>{t("resendIn", { time: clock(seconds) })}</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={pending}
            className="font-semibold text-teal hover:underline disabled:opacity-50"
          >
            {t("resend")}
          </button>
        )}
      </p>
      {state.sent && !failure && (
        <p role="status" className="mt-1 text-success-ink">
          {t("resent")}
        </p>
      )}
      {failure && (
        <p role="alert" className="mt-1 text-danger">
          {errors(failure)}
        </p>
      )}
    </div>
  );
}
