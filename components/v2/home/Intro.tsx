import { home } from "@/content/copy";

export default function Intro() {
  return (
    <section className="bg-bg">
      <div className="container-x py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12">
          <div aria-hidden="true" className="hidden lg:col-span-2 lg:block">
            <span className="mt-5 block h-px w-14 bg-brand" />
          </div>
          <p className="font-display text-[clamp(24px,2.7vw,38px)] font-semibold leading-[1.3] tracking-[-0.02em] text-text lg:col-span-10 lg:max-w-[34ch]">
            {home.hero.supporting}
          </p>
        </div>
      </div>
    </section>
  );
}
