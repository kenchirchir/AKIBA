"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { adminLogIn } from "@/lib/admin/actions";
import { useAdminForm } from "./use-admin-form";

export function AdminLoginForm() {
  const t = useTranslations("Admin.login");
  const { formRef, onSubmit, onChange, error, pending } =
    useAdminForm(adminLogIn);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="mt-8 flex flex-col gap-4"
    >
      <FormMessage message={error("form")} />
      <Field id="email" label={t("email")} required error={error("email")}>
        {(control) => (
          <Input {...control} name="email" type="email" autoComplete="email" />
        )}
      </Field>
      <Field
        id="password"
        label={t("password")}
        required
        error={error("password")}
      >
        {(control) => (
          <Input
            {...control}
            name="password"
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>
      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
