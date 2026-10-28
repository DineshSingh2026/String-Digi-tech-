import { home, v2Ui } from "@/content/copy";
import Button from "@/components/ui/Button";
import Photo from "./Photo";

export default function Hero() {
  const h = home.hero;
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[600px] items-end bg-ink lg:h-[88svh]">
      <Photo
        src="/images/hero-marina-bay.jpg"
        alt={v2Ui.alt.hero}
        sizes="100vw"
        framed={false}
        preload
        className="!absolute inset-0 -z-10"
      />
      {/* Overlays keep the white text above 4.5:1 across the whole photo. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/35 to-transparent" />

      <div className="container-x pb-16 pt-32 lg:pb-24">
        <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/85">
          <span aria-hidden="true" className="h-px w-8 bg-brand" />
          {h.eyebrow}
        </p>
        <h1 id="hero-title" className="display mt-6 max-w-[16ch] !text-white">
          {h.h1}
        </h1>
        <p className="lead mt-6 max-w-[60ch] !text-white/85">{h.sub}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href={h.ctaPrimary.href}>{h.ctaPrimary.label}</Button>
          <Button href={h.ctaSecondary.href} variant="light">
            {h.ctaSecondary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
