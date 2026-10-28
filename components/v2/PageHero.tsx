import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { v2Pages, type Link as CopyLink } from "@/content/copy";
import { ChevronRight } from "./icons";

export type Crumb = { label: string; href: string };

/** Visible breadcrumb trail. Home is prepended; the last crumb is the current page. */
export function Crumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const all = [{ label: v2Pages.breadcrumbHome, href: "/" }, ...items];
  return (
    <nav aria-label={v2Pages.breadcrumbAria} className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.href}-${i}`} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-body">
                  {c.label}
                </span>
              ) : (
                <>
                  <Link href={c.href} className="transition-colors hover:text-text">
                    {c.label}
                  </Link>
                  <ChevronRight className="h-3 w-3 text-muted/70" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type Props = {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  sub?: string;
  primary?: CopyLink;
  secondary?: CopyLink;
  image?: { src: string; alt: string };
  /** split: photo to the right. wide: photo full width below the heading. */
  layout?: "split" | "wide";
  className?: string;
};

/** Shared inner-page hero: breadcrumbs, eyebrow, H1, lead, optional CTAs and a large rounded photo. */
export default function PageHero({
  crumbs,
  eyebrow,
  title,
  sub,
  primary,
  secondary,
  image,
  layout = "split",
  className = "",
}: Props) {
  const split = layout === "split" && image;
  const text = (
    <div className={split ? "lg:col-span-6 lg:pr-4" : "max-w-[880px]"}>
      <Crumbs items={crumbs} className="mb-8 lg:mb-10" />
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <h1 className="display" style={split ? { fontSize: "clamp(36px, 4.1vw, 58px)" } : undefined}>
        {title}
      </h1>
      {sub ? <p className="lead mt-6 max-w-[58ch]">{sub}</p> : null}
      {primary || secondary ? (
        <div className="mt-9 flex flex-wrap gap-3">
          {primary ? <Button href={primary.href}>{primary.label}</Button> : null}
          {secondary ? (
            <Button href={secondary.href} variant="secondary">
              {secondary.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <section className={`bg-bg pb-16 pt-28 md:pt-32 lg:pb-24 lg:pt-32 ${className}`}>
      <div className="container-x">
        {split ? (
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {text}
            <div className="lg:col-span-6">
              <div className="photo aspect-[4/3] shadow-[0_30px_60px_-40px_rgba(15,23,32,0.45)]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  preload
                  sizes="(min-width: 1240px) 590px, (min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {text}
            {image ? (
              <div className="photo mt-12 aspect-[4/3] sm:aspect-[16/9] lg:mt-16 lg:aspect-[21/9]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  preload
                  sizes="(min-width: 1240px) 1176px, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
