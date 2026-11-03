"use client";

import { useState, type FormEvent } from "react";
import { BadgeCheck, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionForm } from "@/components/forms/use-action-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatRwandaPhone } from "@/lib/auth/phone";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { experienceFrom } from "@/lib/experience";
import { districts, findDistrict, sectorSlug } from "@/lib/kigali";
import { saveProfile } from "@/lib/profile/actions";
import type { MyProfile } from "@/lib/profile/data";
import type { ProfileErrorKey } from "@/lib/profile/errors";
import { ProfilePhotoField } from "./profile-photo-field";

const yearOptions = Array.from({ length: 41 }, (_, index) => index);
const monthOptions = Array.from({ length: 12 }, (_, index) => index);

const sectionClasses = "flex flex-col gap-5 lg:rounded-card lg:bg-white lg:p-8";

export function ProfileForm({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Profile");
  const join = useTranslations("Join");
  const catalogue = useTranslations("Catalogue");
  const { formRef, onSubmit, onChange, error, pending } = useActionForm(
    saveProfile,
    {},
    (key: ProfileErrorKey, state) =>
      t(`errors.${key}`, { minutes: state.minutes ?? 15 }),
  );
  const experience = profile.tailoring_since
    ? experienceFrom(profile.tailoring_since)
    : null;
  const [district, setDistrict] = useState(profile.district);
  const [sector, setSector] = useState(profile.sector);
  const [types, setTypes] = useState<string[]>(profile.tailoring_types);
  const [blocked, setBlocked] = useState(false);
  const sectors = findDistrict(district)?.sectors ?? [];
  const experienceError = error("years") ?? error("months");

  function submit(event: FormEvent<HTMLFormElement>) {
    if (event.currentTarget.querySelector("[data-uploading]")) {
      event.preventDefault();
      setBlocked(true);
      return;
    }
    setBlocked(false);
    onSubmit(event);
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onChange={onChange}
      noValidate
      className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6"
    >
      <div className="flex flex-col gap-8 lg:gap-6">
        <section className={sectionClasses}>
          <h2 className="text-section">{t("photos")}</h2>
          <ProfilePhotoField
            name="avatar"
            label={t("avatar")}
            initial={profile.avatar_public_id}
          />
          <ProfilePhotoField
            name="cover"
            label={t("cover")}
            initial={profile.cover_public_id}
          />
        </section>

        <section className={sectionClasses}>
          <h2 className="text-section">{t("shopDetails")}</h2>
          <Field
            id="shopName"
            label={t("shopName")}
            required
            error={error("shopName")}
          >
            {(control) => (
              <Input
                {...control}
                name="shopName"
                defaultValue={profile.shop_name}
                maxLength={80}
                autoComplete="organization"
              />
            )}
          </Field>
          <Field
            id="fullName"
            label={join("fullName")}
            required
            error={error("fullName")}
          >
            {(control) => (
              <Input
                {...control}
                name="fullName"
                defaultValue={profile.owner_name}
                maxLength={80}
                autoComplete="name"
              />
            )}
          </Field>
          <div
            role="group"
            aria-labelledby="experience-label"
            className="flex flex-col gap-1.5"
          >
            <span id="experience-label" className="text-label text-ink">
              {join("experience")}
              <span aria-hidden="true" className="text-danger">
                {" "}
                *
              </span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Select
                name="years"
                aria-label={join("years")}
                defaultValue={String(experience?.years ?? "")}
                aria-invalid={experienceError ? true : undefined}
                aria-describedby={
                  experienceError ? "experience-message" : undefined
                }
              >
                <option value="" disabled>
                  {join("years")}
                </option>
                {yearOptions.map((count) => (
                  <option key={count} value={count}>
                    {join("yearsOption", { count })}
                  </option>
                ))}
              </Select>
              <Select
                name="months"
                aria-label={join("months")}
                defaultValue={String(experience?.months ?? 0)}
              >
                {monthOptions.map((count) => (
                  <option key={count} value={count}>
                    {join("monthsOption", { count })}
                  </option>
                ))}
              </Select>
            </div>
            {experienceError && (
              <p id="experience-message" className="text-caption text-danger">
                {experienceError}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-label text-ink">{join("phone")}</span>
            <p className="flex h-[46px] items-center justify-between rounded-lg border border-line bg-surface px-4 text-base text-secondary">
              {profile.phone ? formatRwandaPhone(profile.phone) : "—"}
              <BadgeCheck
                role="img"
                aria-label={t("phoneVerified")}
                className="size-5 text-success"
              />
            </p>
            <p className="text-caption text-secondary">{t("phoneHint")}</p>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-8 lg:gap-6">
        <section className={sectionClasses}>
          <h2 className="text-section">{t("shopLocation")}</h2>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
            <Field
              id="district"
              label={join("district")}
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
                  {districts.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field
              id="sector"
              label={join("sector")}
              required
              error={error("sector")}
            >
              {(control) => (
                <Select
                  {...control}
                  name="sector"
                  value={sector}
                  onChange={(event) => setSector(event.target.value)}
                >
                  <option value="" disabled>
                    {join("choose")}
                  </option>
                  {sectors.map((name) => (
                    <option key={name} value={sectorSlug(name)}>
                      {name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <Field
            id="shopAddress"
            label={join("shopAddress")}
            required
            error={error("shopAddress")}
          >
            {(control) => (
              <div className="relative">
                <Input
                  {...control}
                  name="shopAddress"
                  defaultValue={profile.shop_address ?? ""}
                  placeholder={join("shopAddressPlaceholder")}
                  maxLength={120}
                  className="pr-11"
                />
                <MapPin className="pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-teal" />
              </div>
            )}
          </Field>
        </section>

        <section className={sectionClasses}>
          <h2 className="text-section">{t("yourWork")}</h2>
          <Field
            id="tailoringTypes"
            label={join("types")}
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
                summary={join("selected", { count: types.length })}
                removeLabel={(label) => join("remove", { item: label })}
                options={tailoringTypeSlugs.map((slug) => ({
                  value: slug,
                  label: catalogue(`tailoringTypes.${slug}`),
                }))}
              />
            )}
          </Field>
          <Field
            id="about"
            label={t("about")}
            hint={t("aboutHint")}
            error={error("about")}
          >
            {(control) => (
              <Textarea
                {...control}
                name="about"
                rows={5}
                maxLength={2000}
                defaultValue={profile.about ?? ""}
                placeholder={t("aboutPlaceholder")}
              />
            )}
          </Field>
        </section>

        <div className="flex flex-col gap-3">
          <FormMessage
            message={(blocked && t("errors.waitForPhotos")) || error("form")}
          />
          <Button type="submit" size="lg" fullWidth disabled={pending}>
            {pending ? t("saving") : t("save")}
          </Button>
          <p className="text-center text-caption text-secondary">
            {t("publicNote")}
          </p>
        </div>
      </div>
    </form>
  );
}
