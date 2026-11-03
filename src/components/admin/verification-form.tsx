"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { verifyTailor } from "@/lib/admin/actions";
import { kigaliDate } from "@/lib/requests/options";
import { useAdminForm } from "./use-admin-form";

type VerificationFormProps = {
  tailorId: string;
  verified: boolean;
  record: {
    association: string | null;
    official_name: string | null;
    visit_date: string | null;
    notes: string | null;
  } | null;
};

export function VerificationForm({
  tailorId,
  verified,
  record,
}: VerificationFormProps) {
  const t = useTranslations("Admin.verify");
  const { formRef, onSubmit, onChange, error, pending } =
    useAdminForm(verifyTailor);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="tailorId" value={tailorId} />
      <FormMessage message={error("form")} />
      <Field
        id="association"
        label={t("association")}
        required
        error={error("association")}
      >
        {(control) => (
          <Input
            {...control}
            name="association"
            defaultValue={record?.association ?? ""}
            placeholder={t("associationPlaceholder")}
          />
        )}
      </Field>
      <Field
        id="official"
        label={t("official")}
        required
        error={error("official")}
      >
        {(control) => (
          <Input
            {...control}
            name="official"
            defaultValue={record?.official_name ?? ""}
          />
        )}
      </Field>
      <Field
        id="visitDate"
        label={t("visitDate")}
        required
        error={error("visitDate")}
      >
        {(control) => (
          <Input
            {...control}
            name="visitDate"
            type="date"
            max={kigaliDate()}
            defaultValue={record?.visit_date ?? ""}
          />
        )}
      </Field>
      <Field id="notes" label={t("notes")} error={error("notes")}>
        {(control) => (
          <Textarea
            {...control}
            name="notes"
            rows={3}
            maxLength={1000}
            defaultValue={record?.notes ?? ""}
          />
        )}
      </Field>
      <div data-field="consent" className="flex flex-col gap-1.5">
        <Checkbox
          name="consent"
          tone="default"
          label={t("consent")}
          defaultChecked={verified}
          aria-invalid={error("consent") ? true : undefined}
          aria-describedby={error("consent") ? "consent-message" : undefined}
        />
        {error("consent") && (
          <p id="consent-message" className="text-caption text-danger">
            {error("consent")}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? t("saving") : verified ? t("update") : t("submit")}
      </Button>
    </form>
  );
}
