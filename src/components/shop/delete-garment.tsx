"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { deleteGarment } from "@/lib/shop/actions";

export function DeleteGarment({ id }: { id: string }) {
  const t = useTranslations("EditGarment");
  const errors = useTranslations("GarmentForm.errors");
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteGarment, {});
  const error = state.errors?.form;

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="self-start px-2 text-danger hover:bg-danger/10"
      >
        <Trash2 />
        {t("delete")}
      </Button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("deleteTitle")}
      >
        <p className="text-body text-secondary">{t("deleteBody")}</p>
        <form action={action} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="id" value={id} />
          <FormMessage message={error ? errors(error) : undefined} />
          <Button type="submit" variant="danger" fullWidth disabled={pending}>
            {pending ? t("deleting") : t("deleteConfirm")}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
            {t("keep")}
          </Button>
        </form>
      </BottomSheet>
    </>
  );
}
