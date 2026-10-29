import NextImage from "next/image";
import type { Image } from "@/lib/schemas";

type Props = { image: Image; sizes: string; preload?: boolean; className?: string };

export function WpImage({ image, sizes, preload = false, className = "" }: Props) {
  if (!image.width || !image.height) {
    return (
      <span className={`relative block overflow-hidden ${className}`}>
        <NextImage src={image.url} alt={image.alt} fill sizes={sizes} preload={preload} className="object-cover" />
      </span>
    );
  }

  return (
    <NextImage
      src={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      preload={preload}
      className={className}
    />
  );
}
