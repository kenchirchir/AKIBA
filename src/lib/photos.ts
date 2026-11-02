export type Photo = {
  publicId: string;
  width: number;
  height: number;
};

export const maxPhotos = 5;

export function photoUrl(publicId: string, width: number) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_${width},f_auto,q_auto/${publicId}`;
}
