"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { PinInput } from "@/components/ui/pin-input";
import { Select } from "@/components/ui/select";
import { signUp } from "@/lib/auth/actions";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { cn } from "@/lib/cn";
import { experienceLevel } from "@/lib/experience";
import { districts, findDistrict, sectorSlug } from "@/lib/kigali";
import { useAuthForm } from "./use-auth-form";

const yearOptions = Array.from({ length: 41 }, (_, index) => index);
const monthOptions = Array.from({ length: 12 }, (_, index) => index);

export function JoinForm() {
  const t = useTranslations("Join");
  const catalogue = useTranslations("Catalogue");
  const experience = useTranslations("Experience");
  const { formRef, onSubmit, onChange, error, pending } = useAuthForm(signUp);
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("0");

  const sectors = findDistrict(district)?.sectors ?? [];
  const experienceError = error("years") ?? error("months");
  const preview =
    years === ""
      ? null
      : t("buyersSee", {
          level: experience(
            `levels.${experienceLevel(Number(years) * 12 + Number(months))}`,
          ),
          time:
            experience("short", {
              years: Number(years),
              months: Number(months),
            }).trim() || experience("underMonth"),
        });

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      className="mt-8 flex flex-col gap-4"
    >
      <FormMessage message={error("form")} />

      <Field
        id="fullName"
        label={t("fullName")}
        required
        error={error("fullName")}
      >
        {(control) => (
          <Input
            {...control}
            name="fullName"
            autoComplete="name"
            placeholder={t("fullNamePlaceholder")}
          />
        )}
      </Field>

      <Field
        id="phone"
        label={t("phone")}
        required
        hint={t("phoneHint")}
        error={error("phone")}
      >
        {(control) => <PhoneInput {...control} name="phone" />}
      </Field>

      <Field id="pin" label={t("pin")} required error={error("pin")}>
        {(control) => (
          <PinInput
            {...control}
            name="pin"
            autoComplete="new-password"
            clear={Boolean(error("pin"))}
          />
        )}
      </Field>

      <Field
        id="district"
        label={t("district")}
        required
        error={error("district")}
      >
        {(control) => (
          <Select
            {...control}
            name="district"
            value={district}
            onChange={(event) => {
              setDistrict(event.target.value);
              setSector("");
            }}
          >
            <option value="" disabled>
              {t("choose")}
            </option>
            {districts.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="tailoringTypes"
        label={t("types")}
        required
        error={error("tailoringTypes")}
      >
        {(control) => (
          <MultiSelect
            id={control.id}
            aria-invalid={control["aria-invalid"]}
            aria-describedby={control["aria-describedby"]}
            name="tailoringTypes"
            value={types}
            onChange={setTypes}
            summary={t("selected", { count: types.length })}
            removeLabel={(label) => t("remove", { item: label })}
            options={tailoringTypeSlugs.map((slug) => ({
              value: slug,
              label: catalogue(`tailoringTypes.${slug}`),
            }))}
          />
        )}
      </Field>

      <div
        role="group"
        aria-labelledby="experience-label"
        className="flex flex-col gap-1.5"
      >
        <span id="experience-label" className="text-label text-ink">
          {t("experience")}
          <span aria-hidden="true" className="text-danger">
            {" "}
            *
          </span>
        </span>
        <div className="grid grid-cols-2 gap-3">
          <Select
            name="years"
            aria-label={t("years")}
            required
            value={years}
            aria-invalid={experienceError ? true : undefined}
            aria-describedby="experience-message"
            onChange={(event) => setYears(event.target.value)}
          >
            <option value="" disabled>
              {t("years")}
            </option>
            {yearOptions.map((count) => (
              <option key={count} value={count}>
                {t("yearsOption", { count })}
              </option>
            ))}
          </Select>
          <Select
            name="months"
            aria-label={t("months")}
            value={months}
            aria-describedby="experience-message"
            onChange={(event) => setMonths(event.target.value)}
          >
            {monthOptions.map((count) => (
              <option key={count} value={count}>
                {t("monthsOption", { count })}
              </option>
            ))}
          </Select>
        </div>
        {(experienceError ?? preview) && (
          <p
            id="experience-message"
            className={cn(
              "text-caption",
              experienceError ? "text-danger" : "text-secondary",
            )}
          >
            {experienceError ?? preview}
          </p>
        )}
      </div>

      <Field
        id="sector"
        label={t("sector")}
        required
        hint={t("sectorHint")}
        error={error("sector")}
      >
        {(control) => (
          <Select
            {...control}
            name="sector"
            value={sector}
            disabled={!district}
            onChange={(event) => setSector(event.target.value)}
          >
            <option value="" disabled>
              {district ? t("choose") : t("chooseDistrictFirst")}
            </option>
            {sectors.map((name) => (
              <option key={name} value={sectorSlug(name)}>
                {name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="shopAddress"
        label={t("shopAddress")}
        required
        error={error("shopAddress")}
      >
        {(control) => (
          <div className="relative">
            <Input
              {...control}
              name="shopAddress"
              placeholder={t("shopAddressPlaceholder")}
              className="pr-11"
            />
            <MapPin className="pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-teal" />
          </div>
        )}
      </Field>

      <div className="flex flex-col gap-1.5">
        <Checkbox
          name="terms"
          aria-invalid={error("terms") ? true : undefined}
          aria-describedby={error("terms") ? "terms-message" : undefined}
          label={
            <span>
              {t("terms")}{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-teal underline underline-offset-2"
              >
                {t("termsLink")}
              </Link>
            </span>
          }
        />
        {error("terms") && (
          <p id="terms-message" className="text-caption text-danger">
            {error("terms")}
          </p>
        )}
      </div>

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? t("submitting") : t("submit")}
      </Button>

      <p className="text-center text-sm text-secondary">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-teal">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
