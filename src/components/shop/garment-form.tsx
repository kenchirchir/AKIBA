"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useActionForm } from "@/components/forms/use-action-form";
import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { PriceInput } from "@/components/ui/price-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { audienceSlugs, categories, materialSlugs } from "@/lib/catalogue";
import { saveGarment } from "@/lib/shop/actions";
import type { GarmentErrorKey } from "@/lib/shop/errors";
import type { GarmentDetails } from "@/lib/shop/garments";
import { PhotoPicker } from "./photo-picker";
import { usePhotoUploads } from "./use-photo-uploads";

function categoryValue(garment?: GarmentDetails) {
  if (!garment) return "";
  return garment.subcategory
    ? `${garment.category}:${garment.subcategory}`
    : garment.category;
}

export function GarmentForm({ garment }: { garment?: GarmentDetails }) {
  const t = useTranslations("GarmentForm");
  const catalogue = useTranslations("Catalogue");
  const { formRef, onSubmit, onChange, error, pending } = useActionForm(
    saveGarment,
    {},
    (key: GarmentErrorKey) => t(`errors.${key}`),
  );
  const uploads = usePhotoUploads(garment?.photos);
  const [blocked, setBlocked] = useState(false);
  const audienceError = error("audience");
  const blocker = uploads.uploading
    ? t("waitForPhotos")
    : uploads.failed
      ? t("fixPhotos")
      : undefined;

  function submit(event: FormEvent<HTMLFormElement>) {
    if (blocker) {
      event.preventDefault();
      setBlocked(true);
      return;
    }
    setBlocked(false);
    onSubmit(event);
  }

  function submitLabel() {
    if (pending) return garment ? t("saving") : t("publishing");
    if (uploads.uploading) return t("uploadingPhotos");
    return garment ? t("save") : t("publish");
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onChange={onChange}
      noValidate
      className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6"
    >
      {garment && <input type="hidden" name="id" value={garment.id} />}
      <input
        type="hidden"
        name="photos"
        value={JSON.stringify(uploads.photos)}
      />

      <section className="lg:rounded-card lg:bg-white lg:p-8">
        <PhotoPicker
          items={uploads.items}
          full={uploads.full}
          error={error("photos")}
          onAdd={uploads.add}
          onRemove={uploads.remove}
          onRetry={uploads.retry}
        />
      </section>

      <section className="@container flex flex-col gap-5 lg:rounded-card lg:bg-white lg:p-8">
        <h2 className="hidden text-section lg:block">{t("details")}</h2>

        <Field id="name" label={t("name")} required error={error("name")}>
          {(control) => (
            <Input
              {...control}
              name="name"
              defaultValue={garment?.name}
              placeholder={t("namePlaceholder")}
              maxLength={80}
              autoComplete="off"
            />
          )}
        </Field>

        <div className="grid gap-5 @sm:grid-cols-2 @sm:gap-3">
          <Field
            id="category"
            label={t("category")}
            required
            error={error("category")}
          >
            {(control) => (
              <Select
                {...control}
                name="category"
                defaultValue={categoryValue(garment)}
              >
                <option value="" disabled>
                  {t("choose")}
                </option>
                {categories.map((category) =>
                  category.slug === "tops" || category.slug === "bottoms" ? (
                    <optgroup
                      key={category.slug}
                      label={catalogue(`categories.${category.slug}`)}
                    >
                      {category.subcategories.map((subcategory) => (
                        <option
                          key={subcategory}
                          value={`${category.slug}:${subcategory}`}
                        >
                          {catalogue(`subcategories.${subcategory}`)}
                        </option>
                      ))}
                      <option value={category.slug}>
                        {t(`other.${category.slug}`)}
                      </option>
                    </optgroup>
                  ) : (
                    <option key={category.slug} value={category.slug}>
                      {catalogue(`categories.${category.slug}`)}
                    </option>
                  ),
                )}
              </Select>
            )}
          </Field>
          <Field id="material" label={t("material")} error={error("material")}>
            {(control) => (
              <Select
                {...control}
                name="material"
                defaultValue={garment?.material ?? ""}
              >
                <option value="">{t("choose")}</option>
                {materialSlugs.map((material) => (
                  <option key={material} value={material}>
                    {catalogue(`materials.${material}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <div data-field="audience" className="flex flex-col gap-1.5">
          <p id="audience-label" className="text-label text-ink">
            {t("audience")}
            <span aria-hidden="true" className="text-danger">
              {" "}
              *
            </span>
          </p>
          <ChoiceGroup
            name="audience"
            options={audienceSlugs.map((audience) => ({
              value: audience,
              label: catalogue(`audiences.${audience}`),
            }))}
            defaultValue={garment?.audience}
            invalid={Boolean(audienceError)}
            aria-labelledby="audience-label"
            aria-describedby={audienceError ? "audience-message" : undefined}
          />
          {audienceError && (
            <p id="audience-message" className="text-caption text-danger">
              {audienceError}
            </p>
          )}
        </div>

        <Field
          id="description"
          label={t("description")}
          error={error("description")}
        >
          {(control) => (
            <Textarea
              {...control}
              name="description"
              rows={3}
              maxLength={1000}
              defaultValue={garment?.description ?? ""}
              placeholder={t("descriptionPlaceholder")}
            />
          )}
        </Field>

        <Field id="story" label={t("story")} required error={error("story")}>
          {(control) => (
            <Textarea
              {...control}
              name="story"
              rows={5}
              maxLength={3000}
              defaultValue={garment?.story}
              placeholder={t("storyPlaceholder")}
            />
          )}
        </Field>

        <Field id="price" label={t("price")} required error={error("price")}>
          {(control) => (
            <PriceInput
              {...control}
              name="price"
              defaultValue={garment?.price_rwf.toLocaleString("en-US")}
            />
          )}
        </Field>

        <FormMessage message={(blocked && blocker) || error("form")} />
        <Button type="submit" fullWidth size="lg" disabled={pending}>
          {submitLabel()}
        </Button>
        <p className="text-center text-label font-normal text-secondary">
          {t("reviewNote")}
        </p>
      </section>
    </form>
  );
}
