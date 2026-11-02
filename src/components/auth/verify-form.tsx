"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { OtpInput } from "@/components/ui/otp-input";
import { resendSignUpCode, verifyPhone } from "@/lib/auth/actions";
import { ResendCode } from "./resend-code";
import { useAuthForm } from "./use-auth-form";

export function VerifyForm({ phone }: { phone: string }) {
  const t = useTranslations("Verify");
  const { formRef, onSubmit, onChange, error, pending } =
    useAuthForm(verifyPhone);

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
        className="mt-6 flex flex-col gap-5"
      >
        <FormMessage message={error("form")} />
        <Field id="code" label={t("code")} required error={error("code")}>
          {(control) => (
            <OtpInput
              {...control}
              name="code"
              autoFocus
              clear={Boolean(error("code"))}
              onComplete={() => formRef.current?.requestSubmit()}
            />
          )}
        </Field>
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </form>
      <ResendCode action={resendSignUpCode} />
      <p className="mt-10 text-center text-sm text-secondary">
        {t("wrongNumber")}{" "}
        <Link href="/join" className="font-semibold text-teal">
          {t("changeIt")}
        </Link>
      </p>
    </>
  );
}
