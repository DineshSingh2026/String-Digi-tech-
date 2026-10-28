import { home, v2Ui } from "@/content/copy";
import Eyebrow from "@/components/ui/Eyebrow";
import { CheckBadge } from "./icons";
import Photo from "./Photo";

export default function Why() {
  const w = home.why;
  return (
    <section aria-labelledby="why-title" className="section-y bg-bg">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Eyebrow className="mb-4">{v2Ui.eyebrows.why}</Eyebrow>
          <h2 id="why-title" className="h2">
            {w.heading}
          </h2>
          <Photo
            src="/images/meeting-notes.jpg"
            alt={v2Ui.alt.why}
            sizes="(min-width: 1024px) 460px, 100vw"
            className="mt-10 hidden aspect-[4/3] lg:block"
          />
        </div>
        <ul className="self-end border-t border-line lg:col-span-7">
          {w.items.map((it) => (
            <li key={it} className="flex items-start gap-5 border-b border-line py-6">
              <CheckBadge className="mt-0.5" />
              <span className="text-[17px] leading-relaxed text-text">{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
