import { home, v2Ui } from "@/content/copy";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Principles() {
  const p = home.principles;
  return (
    <section aria-labelledby="principles-title" className="section-y bg-surface">
      <div className="container-x">
        <SectionHeading id="principles-title" eyebrow={v2Ui.eyebrows.principles} title={p.heading} />
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {p.items.map((it, i) => (
            <li key={it} className="card flex flex-col p-7">
              <span className="num font-display text-[15px] font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className="mt-5 block h-px w-10 bg-line" />
              <p className="h3 mt-5">{it}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
