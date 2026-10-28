import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** Responsive sizes hint for next/image. */
  sizes: string;
  /** Aspect-ratio and sizing classes for the frame, e.g. "aspect-[4/3]". */
  className?: string;
  /** Rounded .photo frame; set false for full-bleed backgrounds. */
  framed?: boolean;
  preload?: boolean;
  imgClassName?: string;
};

/** Fixed-ratio photo frame: the frame reserves space, so there is no layout shift. */
export default function Photo({ src, alt, sizes, className = "", framed = true, preload = false, imgClassName = "" }: Props) {
  return (
    <div className={`${framed ? "photo" : "relative overflow-hidden"} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className={`object-cover ${imgClassName}`} />
    </div>
  );
}
