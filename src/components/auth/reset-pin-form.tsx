"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { OtpInput } from "@/components/ui/otp-input";
import { PinInput } from "@/components/ui/pin-input";
import { resendResetCode, resetPin } from "@/lib/auth/actions";
import { ResendCode } from "./resend-code";
import { useAuthForm } from "./use-auth-form";

export function ResetPinForm({ phone }: { phone: string }) {
  const t = useTranslations("ResetPin");
  const { formRef, onSubmit, onChange, error, pending } = useAuthForm(resetPin);
  const pinRefused = Boolean(error("pin") || error("confirm"));

  return (
    <>
      <p className="mt-6 text-body text-secondary">
        {t.rich("sent", {
          phone,
          strong: (chunks) => (
            <strong className="font-semibold text-ink">{chunks}</strong>
          ),
        })}
      </p>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        onChange={onChange}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <FormMessage message={error("form")} />
        <Field id="code" label={t("code")} required error={error("code")}>
          {(control) => (
            <OtpInput
              {...control}
              name="code"
              autoFocus
              clear={Boolean(error("code"))}
            />
          )}
        </Field>
        <Field id="pin" label={t("pin")} required error={error("pin")}>
          {(control) => (
            <PinInput
              {...control}
              name="pin"
              autoComplete="new-password"
              clear={pinRefused}
            />
          )}
        </Field>
        <Field
          id="confirm"
          label={t("confirm")}
          required
          error={error("confirm")}
        >
          {(control) => (
            <PinInput
              {...control}
              name="confirm"
              autoComplete="new-password"
              clear={pinRefused}
            />
          )}
        </Field>
        <Button type="submit" fullWidth disabled={pending} className="mt-2">
          {pending ? t("saving") : t("save")}
        </Button>
      </form>
      <ResendCode action={resendResetCode} />
    </>
  );
}
