"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { PhoneInput } from "@/components/ui/phone-input";
import { requestPinReset } from "@/lib/auth/actions";
import { useAuthForm } from "./use-auth-form";

export function ResetRequestForm() {
  const t = useTranslations("ResetPin");
  const { formRef, onSubmit, onChange, error, pending } =
    useAuthForm(requestPinReset);

  return (
    <>
      <p className="mt-6 text-body text-secondary">{t("intro")}</p>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        onChange={onChange}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <FormMessage message={error("form")} />
        <Field id="phone" label={t("phone")} required error={error("phone")}>
          {(control) => <PhoneInput {...control} name="phone" />}
        </Field>
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? t("sending") : t("send")}
        </Button>
      </form>
      <p className="mt-6 text-sm text-secondary">
        {t("remembered")}{" "}
        <Link href="/login" className="font-semibold text-teal">
          {t("login")}
        </Link>
      </p>
    </>
  );
}
