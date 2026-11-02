import type { SignedPhotoUpload } from "@/lib/cloudinary";
import type { Photo } from "@/lib/photos";

const maxSide = 1600;
const quality = 0.82;

function decode(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = document.createElement("img");
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This photo could not be read."));
    };
    image.src = url;
  });
}

export async function shrinkPhoto(file: File): Promise<Blob> {
  try {
    const image = await decode(file);
    const scale = Math.min(
      1,
      maxSide / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function sendPhoto(
  upload: SignedPhotoUpload,
  file: Blob,
  onProgress: (percent: number) => void,
) {
  return new Promise<Photo>((resolve, reject) => {
    const body = new FormData();
    for (const [key, value] of Object.entries(upload.fields)) {
      body.append(key, value);
    }
    body.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", upload.url);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Cloudinary answered ${request.status}`));
        return;
      }
      const data = JSON.parse(request.responseText) as {
        public_id: string;
        width: number;
        height: number;
      };
      resolve({
        publicId: data.public_id,
        width: data.width,
        height: data.height,
      });
    };
    request.onerror = () => reject(new Error("The upload was interrupted."));
    request.send(body);
  });
}
