"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Camera, ImageIcon, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { ProgressBar } from "@/components/ui/progress-bar";
import { sendPhoto, shrinkPhoto } from "@/components/shop/photo-upload";
import { cn } from "@/lib/cn";
import { discardProfilePhoto, signProfilePhoto } from "@/lib/profile/actions";

type ProfilePhotoFieldProps = {
  name: "avatar" | "cover";
  label: string;
  initial: string | null;
};

type Status = "idle" | "uploading" | "failed";

export function ProfilePhotoField({
  name,
  label,
  initial,
}: ProfilePhotoFieldProps) {
  const t = useTranslations("Profile");
  const [publicId, setPublicId] = useState(initial);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const round = name === "avatar";

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function forget(photo: string | null) {
    if (photo && photo !== initial) {
      discardProfilePhoto(photo).catch(() => undefined);
    }
  }

  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setStatus("uploading");
    setProgress(0);

    try {
      const ticket = await signProfilePhoto();
      if (!ticket) throw new Error("Not signed in");
      const photo = await sendPhoto(
        ticket,
        await shrinkPhoto(file),
        setProgress,
      );
      forget(publicId);
      setPublicId(photo.publicId);
      setStatus("idle");
    } catch {
      setStatus("failed");
    }
  }

  function remove() {
    forget(publicId);
    setPublicId(null);
    setPreview(null);
    setStatus("idle");
  }

  const shown = status === "idle" && publicId ? publicId : null;

  return (
    <div
      data-field={name}
      data-uploading={status === "uploading" || undefined}
      className="flex flex-col gap-2"
    >
      <span className="text-label text-ink">{label}</span>
      <input
        type="hidden"
        name={name}
        value={status === "idle" ? (publicId ?? "") : ""}
      />
      <div className={cn("flex gap-4", round ? "items-center" : "flex-col")}>
        <span
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden bg-brand-50 text-teal",
            round ? "size-24 rounded-full" : "aspect-[3/1] w-full rounded-card",
          )}
        >
          {preview && !shown ? (
            <Image
              src={preview}
              alt=""
              fill
              sizes={round ? "96px" : "(min-width: 1024px) 40vw, 100vw"}
              className="object-cover"
            />
          ) : shown ? (
            <CloudImage
              publicId={shown}
              alt=""
              fill
              sizes={round ? "96px" : "(min-width: 1024px) 40vw, 100vw"}
              className="object-cover"
            />
          ) : round ? (
            <UserRound strokeWidth={1.5} className="size-10" />
          ) : (
            <ImageIcon strokeWidth={1.5} className="size-10" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {status === "uploading" && (
            <ProgressBar
              value={progress}
              label={t("uploading", { percent: progress })}
            />
          )}
          {status === "failed" && (
            <p role="alert" className="text-caption text-danger">
              {t("uploadFailed")}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <label
              className={buttonClasses({
                variant: "secondary",
                size: "sm",
                className:
                  "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-teal",
              })}
            >
              <Camera />
              {publicId || preview ? t("changePhoto") : t("addPhoto")}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={pick}
              />
            </label>
            {(publicId || preview) && status !== "uploading" && (
              <button
                type="button"
                onClick={remove}
                className="px-2 text-label font-semibold text-danger hover:underline focus-visible:outline-2 focus-visible:outline-teal"
              >
                {t("removePhoto")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
