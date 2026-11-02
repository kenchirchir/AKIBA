import "server-only";
import { createHash, randomUUID } from "node:crypto";

const allowedFormats = "jpg,jpeg,png,webp,heic,heif,avif";
const incomingLimit = "c_limit,h_2000,w_2000";

function cloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not set up. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local and to Vercel.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function sign(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(payload + apiSecret)
    .digest("hex");
}

function timestamp() {
  return String(Math.floor(Date.now() / 1000));
}

export function photoFolder(tailorId: string) {
  return `akiba/garments/${tailorId}`;
}

export function ownsPhoto(tailorId: string, publicId: string) {
  return publicId.startsWith(`${photoFolder(tailorId)}/`);
}

export function signedPhotoUpload(tailorId: string) {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const params = {
    allowed_formats: allowedFormats,
    public_id: `${photoFolder(tailorId)}/${randomUUID()}`,
    timestamp: timestamp(),
    transformation: incomingLimit,
  };

  return {
    url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    fields: { ...params, api_key: apiKey, signature: sign(params, apiSecret) },
  };
}

export type SignedPhotoUpload = ReturnType<typeof signedPhotoUpload>;

export async function destroyPhotos(publicIds: string[]) {
  if (publicIds.length === 0) return;

  try {
    const { cloudName, apiKey, apiSecret } = cloudinaryConfig();

    await Promise.all(
      publicIds.map((publicId) => {
        const params = {
          invalidate: "true",
          public_id: publicId,
          timestamp: timestamp(),
        };

        return fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
          {
            method: "POST",
            body: new URLSearchParams({
              ...params,
              api_key: apiKey,
              signature: sign(params, apiSecret),
            }),
          },
        );
      }),
    );
  } catch (error) {
    console.error("Could not delete photos from Cloudinary", error);
  }
}
