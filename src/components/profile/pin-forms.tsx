"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionForm } from "@/components/forms/use-action-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { PinInput } from "@/components/ui/pin-input";
import { changePin, deleteAccount } from "@/lib/profile/actions";
import type { ProfileErrorKey, ProfileFormState } from "@/lib/profile/errors";

function useProfileForm(
  action: (
    state: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>,
) {
  const t = useTranslations("Profile.errors");

  return useActionForm(action, {}, (key: ProfileErrorKey, state) =>
    t(key, { minutes: state.minutes ?? 15 }),
  );
}

export function ChangePinForm() {
  const t = useTranslations("Profile.pin");
  const { formRef, onSubmit, onChange, error, pending } =
    useProfileForm(changePin);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="flex flex-col gap-4"
    >
      <p className="text-body text-secondary">{t("intro")}</p>
      <FormMessage message={error("form")} />
      <Field
        id="current"
        label={t("current")}
        required
        error={error("current")}
      >
        {(control) => (
          <PinInput
            {...control}
            name="current"
            clear={Boolean(error("current"))}
          />
        )}
      </Field>
      <Field id="pin" label={t("new")} required error={error("pin")}>
        {(control) => (
          <PinInput
            {...control}
            name="pin"
            autoComplete="new-password"
            clear={Boolean(error("pin") ?? error("confirm"))}
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
            clear={Boolean(error("pin") ?? error("confirm"))}
          />
        )}
      </Field>
      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? t("saving") : t("save")}
      </Button>
      <p className="text-center text-sm text-secondary">
        {t("forgot")}{" "}
        <Link
          href="/login/reset"
          className="font-semibold text-teal underline-offset-2 hover:underline"
        >
          {t("reset")}
        </Link>
      </p>
    </form>
  );
}

export function DeleteAccountForm() {
  const t = useTranslations("Profile.delete");
  const { formRef, onSubmit, onChange, error, pending } =
    useProfileForm(deleteAccount);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="flex flex-col gap-4"
    >
      <FormMessage message={error("form")} />
      <Field id="pin" label={t("pin")} required error={error("pin")}>
        {(control) => (
          <PinInput {...control} name="pin" clear={Boolean(error("pin"))} />
        )}
      </Field>
      <Button
        type="submit"
        variant="danger"
        size="lg"
        fullWidth
        disabled={pending}
      >
        {pending ? t("deleting") : t("confirm")}
      </Button>
      <Link
        href="/shop/profile"
        className="text-center text-sm font-semibold text-teal underline-offset-2 hover:underline"
      >
        {t("keep")}
      </Link>
    </form>
  );
}
