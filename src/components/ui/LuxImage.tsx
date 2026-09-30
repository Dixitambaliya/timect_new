"use client";

import Image, { type ImageProps } from "next/image";
import { cloudinaryLoader, isCloudinary } from "@/lib/cloudinary";

/**
 * next/image with Cloudinary delivery (AVIF/WebP, width-limited) for CDN assets,
 * and the built-in optimizer for local /public files.
 */
export default function LuxImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const loader = isCloudinary(src) ? cloudinaryLoader : undefined;
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} loader={loader} />;
}
