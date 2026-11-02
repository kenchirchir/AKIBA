"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { PhoneInput } from "@/components/ui/phone-input";
import { PinInput } from "@/components/ui/pin-input";
import { logIn } from "@/lib/auth/actions";
import { useAuthForm } from "./use-auth-form";

type LoginFormProps = {
  defaultPhone?: string;
  verified?: boolean;
};

export function LoginForm({ defaultPhone, verified }: LoginFormProps) {
  const t = useTranslations("Login");
  const { formRef, onSubmit, onChange, error, pending } = useAuthForm(logIn);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="mt-8 flex flex-col gap-4"
    >
      {verified && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-card bg-brand-50 px-3 py-3 text-sm text-ink"
        >
          <CircleCheck className="size-4 shrink-0 text-teal" />
          {t("verified")}
        </p>
      )}
      <FormMessage message={error("form")} />
      <Field id="phone" label={t("phone")} required error={error("phone")}>
        {(control) => (
          <PhoneInput {...control} name="phone" defaultValue={defaultPhone} />
        )}
      </Field>
      <Field id="pin" label={t("pin")} required error={error("pin")}>
        {(control) => (
          <PinInput {...control} name="pin" clear={Boolean(error("pin"))} />
        )}
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox name="remember" defaultChecked label={t("remember")} />
        <p className="text-label font-normal text-secondary">
          {t("forgotPin")}{" "}
          <Link href="/login/reset" className="font-semibold text-teal">
            {t("reset")}
          </Link>
        </p>
      </div>
      <Button type="submit" fullWidth disabled={pending} className="mt-2">
        {pending ? t("submitting") : t("submit")}
      </Button>
      <p className="text-center text-sm text-secondary">
        {t("noAccount")}{" "}
        <Link href="/join" className="font-semibold text-teal">
          {t("signUp")}
        </Link>
      </p>
    </form>
  );
}
