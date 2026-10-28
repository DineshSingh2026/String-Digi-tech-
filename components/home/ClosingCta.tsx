import { home, v2Ui } from "@/content/copy";
import Button from "@/components/ui/Button";
import Photo from "./Photo";

export default function ClosingCta() {
  const c = home.closing;
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden bg-ink">
      <Photo
        src="/images/skyline-sunset.jpg"
        alt={v2Ui.alt.closing}
        sizes="100vw"
        framed={false}
        className="!absolute inset-0 -z-10"
      />
      {/* Heavier on the left where the text sits, lighter on the right so the sunset reads. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/15" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/50 to-transparent" />
      <div className="container-x py-28 lg:py-40">
        <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/85">
          <span aria-hidden="true" className="h-px w-8 bg-brand" />
          {v2Ui.eyebrows.closing}
        </p>
        <h2 id="closing-title" className="h2 mt-5 max-w-[22ch] !text-white">
          {c.heading}
        </h2>
        <p className="lead mt-5 max-w-[56ch] !text-white/85">{c.body}</p>
        <Button href={c.cta.href} variant="light" className="mt-10">
          {c.cta.label}
        </Button>
      </div>
    </section>
  );
}
