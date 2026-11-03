"use client";

import { useOptimistic, useTransition } from "react";
import { CircleCheck, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonClasses } from "@/components/ui/button";
import { localRwandaPhone } from "@/lib/auth/phone";
import { markRequestRead, setRequestOrdered } from "@/lib/requests/actions";

type RequestActionsProps = {
  id: string;
  phone: string;
  status: string;
};

export function RequestActions({ id, phone, status }: RequestActionsProps) {
  const t = useTranslations("Requests");
  const [, startTransition] = useTransition();
  const [ordered, setOrdered] = useOptimistic(status === "ordered");

  function changeOrdered(next: boolean) {
    startTransition(async () => {
      setOrdered(next);
      await setRequestOrdered(id, next);
    });
  }

  return (
    <div className="mt-3 grid grid-cols-2 items-center gap-2">
      <a
        href={`tel:${phone}`}
        aria-label={t("call", { phone: localRwandaPhone(phone) })}
        onClick={() => {
          if (status === "new") startTransition(() => markRequestRead(id));
        }}
        className={buttonClasses({ size: "sm" })}
      >
        <Phone />
        {localRwandaPhone(phone)}
      </a>
      {ordered ? (
        <span className="flex h-10 items-center gap-3 px-1 text-sm font-semibold text-success-ink">
          <span className="flex items-center gap-1.5">
            <CircleCheck className="size-[18px]" />
            {t("ordered")}
          </span>
          <button
            type="button"
            onClick={() => changeOrdered(false)}
            className="font-medium text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            {t("undo")}
          </button>
        </span>
      ) : (
        <Button variant="outline" size="sm" onClick={() => changeOrdered(true)}>
          <CircleCheck />
          {t("markOrdered")}
        </Button>
      )}
    </div>
  );
}
