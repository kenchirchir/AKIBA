"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { rejectGarment } from "@/lib/admin/actions";
import { rejectReasons } from "@/lib/admin/options";
import { useAdminForm } from "./use-admin-form";

export function RejectForm({ garmentId }: { garmentId: string }) {
  const t = useTranslations("Admin.garments");
  const reasons = useTranslations("Admin.reasons");
  const [open, setOpen] = useState(false);
  const { formRef, onSubmit, onChange, error, pending } =
    useAdminForm(rejectGarment);

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        {t("reject")}
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="flex w-full flex-col gap-3 rounded-card bg-surface p-4"
    >
      <input type="hidden" name="garmentId" value={garmentId} />
      <FormMessage message={error("form")} />
      <Field
        id={`reason-${garmentId}`}
        label={t("reason")}
        required
        error={error("reason")}
      >
        {(control) => (
          <Select {...control} name="reason" defaultValue="">
            <option value="" disabled>
              {t("chooseReason")}
            </option>
            {rejectReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reasons(reason)}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field
        id={`note-${garmentId}`}
        label={t("note")}
        hint={t("noteHint")}
        error={error("note")}
      >
        {(control) => <Input {...control} name="note" maxLength={300} />}
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? t("rejecting") : t("confirmReject")}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
