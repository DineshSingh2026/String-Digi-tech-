import Link from "next/link";
import { nav, pagesUi } from "@/content/copy";
import Reveal from "@/components/ui/Reveal";
import Spotlight from "@/components/ui/Spotlight";
import Panel from "./Panel";

type Group = { heading: string; items: readonly string[] };

const pad = (n: number) => String(n).padStart(2, "0");
export const slugId = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Hero aside: compact spec sheet of every group plus a solution switcher. */
export function SpecSheet({ title, groups, current }: { title: string; groups: readonly Group[]; current: string }) {
  const total = nav.solutions.length;
  const idx = nav.solutions.findIndex((l) => l.href === current);
  return (
    <Panel
      title={
        <>
          {pagesUi.specSheet} <span className="text-accent">{"//"}</span> {title}
        </>
      }
      right={
        <span className="mono text-[11px] text-muted">
          {pad(idx + 1)}/{pad(total)}
        </span>
      }
      bodyClassName="px-5 py-2"
      footer={
        <nav aria-label={nav.solutionsLabel}>
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {nav.solutions.map((l, i) => {
              const on = l.href === current;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={on ? "page" : undefined}
                    className={`mono flex h-full flex-col gap-1 rounded-md border px-2.5 py-2 text-[10.5px] uppercase leading-tight tracking-[0.08em] transition-colors ${
                      on
                        ? "border-accent/50 bg-accent/10 text-text"
                        : "border-white/[0.06] text-muted hover:border-white/20 hover:text-text"
                    }`}
                  >
                    <span className={on ? "text-accent" : "text-muted/70"}>{pad(i + 1)}</span>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      }
    >
      <dl>
        {groups.map((g, gi) => (
          <div key={g.heading} className={`py-4 ${gi > 0 ? "border-t border-white/[0.06]" : ""}`}>
            <dt className="mono mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.14em]">
              <a href={`#${slugId(g.heading)}`} className="text-muted transition-colors hover:text-accent">
                <span className="text-accent">{pad(gi + 1)}</span> · {g.heading}
              </a>
              <span className="text-muted/80">
                [{pad(g.items.length)}]
              </span>
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {g.items.map((it) => (
                <span
                  key={it}
                  className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 text-[12.5px] leading-snug text-text/90"
                >
                  {it}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/** Each group as a row: heading block left, numbered spec cells right. */
export function SpecGroups({ groups }: { groups: readonly Group[] }) {
  if (groups.length > 1) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, gi) => (
          <div key={g.heading} id={slugId(g.heading)} className="scroll-mt-28">
            <Reveal delay={gi * 0.06}>
              <div className="flex items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <p className="mono text-[13px] tracking-[0.14em] text-accent">{pad(gi + 1)}</p>
                  <h2 className="mt-3 font-display text-[clamp(26px,2.4vw,34px)] leading-[1.05]">{g.heading}</h2>
                </div>
                <span className="mono text-[11px] uppercase tracking-[0.14em] text-muted">[{pad(g.items.length)}]</span>
              </div>
            </Reveal>
            <ol className="mt-4 flex flex-col gap-2.5">
              {g.items.map((it, i) => (
                <li key={it}>
                  <Reveal delay={gi * 0.06 + i * 0.04}>
                    <Spotlight className="panel group flex min-h-[92px] items-start gap-5 p-5">
                      <span className="mono pt-1 text-[11px] tracking-[0.12em] text-muted">
                        <span className="text-accent">{pad(gi + 1)}</span>.{pad(i + 1)}
                      </span>
                      <p className="font-display text-[19px] leading-[1.25] tracking-[-0.02em] md:text-[20px]">{it}</p>
                    </Spotlight>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-20 lg:gap-28">
      {groups.map((g, gi) => (
        <div key={g.heading} id={slugId(g.heading)} className="grid scroll-mt-28 grid-cols-12 gap-x-6 gap-y-8">
          <Reveal className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="mono text-[56px] leading-none tracking-[-0.04em] text-accent/90 md:text-[72px]">{pad(gi + 1)}</p>
              <h2 className="mt-5 font-display text-[clamp(28px,3vw,40px)] leading-[1.05]">{g.heading}</h2>
              <div className="mono mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
                <span className="h-px w-8 bg-accent" aria-hidden="true" />[{pad(g.items.length)}]
              </div>
            </div>
          </Reveal>
          <ol className="col-span-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8">
            {g.items.map((it, i) => (
              <li key={it} className={g.items.length % 2 === 1 && i === g.items.length - 1 ? "sm:col-span-2" : ""}>
                <Reveal delay={i * 0.05} className="h-full">
                  <Spotlight className="panel group flex h-full min-h-[148px] flex-col justify-between gap-8 p-6">
                    <div className="mono flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted">
                      <span>
                        <span className="text-accent">{pad(gi + 1)}</span>.{pad(i + 1)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-white/20 transition-colors duration-300 group-hover:bg-accent"
                      />
                    </div>
                    <p className="font-display text-[21px] leading-[1.2] tracking-[-0.02em] md:text-[23px]">{it}</p>
                  </Spotlight>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
