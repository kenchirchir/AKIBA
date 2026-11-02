"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { photoUrl } from "@/lib/photos";

function cloudinaryLoader({ src, width }: ImageLoaderProps) {
  return photoUrl(src, width);
}

type CloudImageProps = Omit<ImageProps, "src" | "loader"> & {
  publicId: string;
};

export function CloudImage({ publicId, alt, ...props }: CloudImageProps) {
  return (
    <Image loader={cloudinaryLoader} src={publicId} alt={alt} {...props} />
  );
}
