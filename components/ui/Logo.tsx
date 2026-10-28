import Image from "next/image";
import { company } from "@/content/copy";

// Source assets: public/brand/logo-full.png (438×121, transparent) and logo-mark.png (180×180).
const FULL = { src: "/brand/logo-full.png", w: 438, h: 121 };
const MARK = { src: "/brand/logo-mark.png", w: 180, h: 180 };

type Props = {
  variant?: "full" | "mark";
  /** Rendered height in px; width follows the aspect ratio. */
  height?: number;
  priority?: boolean;
  className?: string;
};

export default function Logo({ variant = "full", height = 36, priority = false, className = "" }: Props) {
  const a = variant === "full" ? FULL : MARK;
  const width = Math.round((a.w / a.h) * height);
  return (
    <Image
      src={a.src}
      alt={company.wordmark}
      width={width}
      height={height}
      preload={priority}
      unoptimized
      className={`block select-none ${className}`}
      style={{ width, height }}
    />
  );
}
