import { useEffect, useRef, useState } from "react";
import type { SignedPhotoUpload } from "@/lib/cloudinary";
import { maxPhotos, type Photo } from "@/lib/photos";
import { discardPhoto, signPhotoUploads } from "@/lib/shop/actions";
import { sendPhoto, shrinkPhoto } from "./photo-upload";

export type PhotoItem = {
  key: string;
  status: "uploading" | "done" | "failed";
  progress: number;
  preview?: string;
  file?: Blob;
  photo?: Photo;
  saved: boolean;
};

let lastKey = 0;

function newKey() {
  lastKey += 1;
  return `photo-${lastKey}`;
}

function forget(publicId: string) {
  discardPhoto(publicId).catch(() => undefined);
}

export function usePhotoUploads(saved: Photo[] = []) {
  const [items, setItems] = useState<PhotoItem[]>(() =>
    saved.map((photo) => ({
      key: photo.publicId,
      status: "done",
      progress: 100,
      photo,
      saved: true,
    })),
  );
  const previews = useRef<string[]>([]);
  const removed = useRef(new Set<string>());

  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function update(key: string, change: Partial<PhotoItem>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...change } : item)),
    );
  }

  async function upload(key: string, file: Blob, signed?: SignedPhotoUpload) {
    update(key, { status: "uploading", progress: 0, file });

    try {
      const ticket = signed ?? (await signPhotoUploads(1))[0];
      if (!ticket) throw new Error("Not signed in");

      const photo = await sendPhoto(ticket, file, (progress) =>
        update(key, { progress }),
      );

      if (removed.current.has(key)) {
        forget(photo.publicId);
        return;
      }
      update(key, { status: "done", progress: 100, photo, file: undefined });
    } catch {
      update(key, { status: "failed" });
    }
  }

  async function add(files: File[]) {
    const picked = files.slice(0, maxPhotos - items.length);
    if (picked.length === 0) return;

    const added = picked.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      return {
        key: newKey(),
        status: "uploading" as const,
        progress: 0,
        preview,
        saved: false,
      };
    });
    setItems((current) => [...current, ...added]);

    const tickets = await signPhotoUploads(picked.length).catch(() => []);
    await Promise.all(
      added.map(async (item, index) =>
        upload(item.key, await shrinkPhoto(picked[index]), tickets[index]),
      ),
    );
  }

  function remove(key: string) {
    const item = items.find((entry) => entry.key === key);
    removed.current.add(key);
    setItems((current) => current.filter((entry) => entry.key !== key));
    if (item?.photo && !item.saved) forget(item.photo.publicId);
  }

  function retry(key: string) {
    const item = items.find((entry) => entry.key === key);
    if (item?.file) void upload(key, item.file);
  }

  return {
    items,
    photos: items.flatMap((item) =>
      item.status === "done" && item.photo ? [item.photo] : [],
    ),
    uploading: items.some((item) => item.status === "uploading"),
    failed: items.some((item) => item.status === "failed"),
    full: items.length >= maxPhotos,
    add,
    remove,
    retry,
  };
}
