"use client";

import { useState } from "react";
import { Phone, Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionForm } from "@/components/forms/use-action-form";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { sendRequest } from "@/lib/requests/actions";
import type { RequestErrorKey } from "@/lib/requests/errors";
import {
  bestTimes,
  kigaliDate,
  maxNeededByDays,
  maxQuantity,
  requestSizes,
} from "@/lib/requests/options";

export type RequestGarment = {
  id: string;
  name: string;
  price: number;
  cover?: string;
  shop: string;
  area: string;
  tailorName: string;
};

function RequestForm({
  garment,
  onCancel,
}: {
  garment: RequestGarment;
  onCancel: () => void;
}) {
  const t = useTranslations("RequestForm");
  const options = useTranslations("RequestOptions");
  const story = useTranslations("GarmentStory");
  const { formRef, onSubmit, onChange, error, pending } = useActionForm(
    sendRequest,
    {},
    (key: RequestErrorKey) => t(`errors.${key}`),
  );

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="garmentId" value={garment.id} />
      <div className="flex items-center gap-3 rounded-card border border-line-soft p-3">
        <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-teal">
          {garment.cover ? (
            <CloudImage
              publicId={garment.cover}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <Shirt strokeWidth={1.5} className="size-5" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold">
            {garment.name}
          </span>
          <span className="truncate text-caption text-secondary">
            {garment.shop} · {garment.area}
          </span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-teal">
          {story("price", { price: garment.price })}
        </span>
      </div>

      <Field id="request-name" label={t("name")} required error={error("name")}>
        {(control) => (
          <Input
            {...control}
            name="name"
            placeholder={t("namePlaceholder")}
            autoComplete="name"
            maxLength={80}
          />
        )}
      </Field>

      <Field
        id="request-phone"
        label={t("phone")}
        required
        error={error("phone")}
      >
        {(control) => <PhoneInput {...control} name="phone" />}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field
          id="request-size"
          label={t("size")}
          required
          error={error("size")}
        >
          {(control) => (
            <Select {...control} name="size" defaultValue="">
              <option value="" disabled>
                {t("choose")}
              </option>
              {requestSizes.map((size) => (
                <option key={size} value={size}>
                  {options(`sizes.${size}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field
          id="request-quantity"
          label={t("quantity")}
          required
          error={error("quantity")}
        >
          {(control) => (
            <Select {...control} name="quantity" defaultValue="1">
              {Array.from({ length: maxQuantity }, (_, index) => (
                <option key={index} value={index + 1}>
                  {t("pieces", { count: index + 1 })}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          id="request-needed-by"
          label={t("neededBy")}
          required
          error={error("neededBy")}
        >
          {(control) => (
            <Input
              {...control}
              name="neededBy"
              type="date"
              min={kigaliDate()}
              max={kigaliDate(maxNeededByDays)}
            />
          )}
        </Field>
        <Field id="request-best-time" label={t("bestTime")}>
          {(control) => (
            <Select {...control} name="bestTime" defaultValue="anytime">
              {bestTimes.map((time) => (
                <option key={time} value={time}>
                  {options(`times.${time}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <p className="flex gap-3 rounded-card bg-brand-50 p-3 text-caption text-ink">
        <Phone className="mt-0.5 size-4 shrink-0 text-teal" />
        {t("note", { name: garment.tailorName })}
      </p>

      <FormMessage message={error("form")} />

      <div className="grid grid-cols-2 gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t("sending") : t("send")}
        </Button>
        <Button variant="secondary" size="lg" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}

export function RequestSheet({ garment }: { garment: RequestGarment }) {
  const t = useTranslations("RequestForm");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" fullWidth onClick={() => setOpen(true)}>
        {t("open")}
      </Button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("title")}
      >
        <RequestForm garment={garment} onCancel={() => setOpen(false)} />
      </BottomSheet>
    </>
  );
}
