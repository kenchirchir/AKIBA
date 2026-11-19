"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { archiveGarment, restoreGarment } from "@/lib/shop/actions";

export function ArchiveGarment({
  id,
  archived,
}: {
  id: string;
  archived: boolean;
}) {
  const t = useTranslations("EditGarment");
  const errors = useTranslations("GarmentForm.errors");
  const [state, action, pending] = useActionState(
    archived ? restoreGarment : archiveGarment,
    {},
  );
  const error = state.errors?.form;

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <FormMessage message={error ? errors(error) : undefined} />
      <Button
        type="submit"
        variant="secondary"
        disabled={pending}
        className="self-start"
      >
        {archived ? <ArchiveRestore /> : <Archive />}
        {archived
          ? pending
            ? t("restoring")
            : t("restore")
          : pending
            ? t("archiving")
            : t("archive")}
      </Button>
    </form>
  );
}
