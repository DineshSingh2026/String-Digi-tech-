import Link from "next/link";
import ServiceTileCanvas, { type TileKind } from "@/components/interactive/ServiceTileCanvas";
import { homeBandsUi } from "@/content/copy";
import SimLabel from "./SimLabel";
import Spotlight from "./Spotlight";

type Variant = "tall" | "wide" | "default";
type Props = { title: string; body: string; href: string; kind: TileKind; index?: number; variant?: Variant };

const CANVAS_H: Record<Variant, string> = {
  tall: "min-h-[300px] md:min-h-[360px] flex-1",
  wide: "min-h-[240px] md:min-h-[300px] lg:min-h-0 lg:h-full",
  default: "h-[220px] md:h-[230px]",
};

/** Bento capability tile: glass terminal panel, live 2D illustration, number/title/body and an explore cue. */
export default function ServiceTile({ title, body, href, kind, index = 0, variant = "default" }: Props) {
  const ui = homeBandsUi.services;
  const wide = variant === "wide";
  return (
    <Spotlight className="panel h-full">
      <Link
        href={href}
        className="group flex h-full flex-col rounded-[14px] focus-visible:outline-offset-4"
      >
        <div className="panel-header">
          <span className="flex min-w-0 items-center gap-3">
            <span className="panel-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="truncate text-text/80">{ui.headers[kind]}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="live-dot" aria-hidden="true" />
            <SimLabel className="hidden !text-[10px] sm:block" />
          </span>
        </div>
        <div className={`flex flex-1 flex-col ${wide ? "lg:flex-row-reverse" : ""}`}>
          <div
            className={`relative w-full overflow-hidden bg-bg/40 ${CANVAS_H[variant]} ${
              wide ? "lg:w-[62%] lg:border-l lg:border-line/70" : "border-b border-line/70"
            } ${wide ? "border-b border-line/70 lg:border-b-0" : ""}`}
          >
            <ServiceTileCanvas kind={kind} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface/60 to-transparent" />
          </div>
          <div className={`flex flex-col gap-3 p-6 md:p-7 ${wide ? "lg:w-[38%] lg:justify-center lg:p-10" : ""}`}>
            <span className="mono text-[12px] text-accent">{String(index + 1).padStart(2, "0")}</span>
            <h3 className={`font-display leading-[1.1] ${variant === "tall" || wide ? "text-[26px] md:text-[32px]" : "text-[22px] md:text-[25px]"}`}>
              {title}
            </h3>
            <p className="text-[15px] leading-relaxed text-muted">{body}</p>
            <span className="mono mt-auto inline-flex items-center gap-2 pt-3 text-[12px] uppercase tracking-[0.12em] text-text">
              {ui.explore}
              <span
                aria-hidden="true"
                className="inline-block text-[16px] text-accent transition-transform duration-300 ease-[var(--ease-ui)] group-hover:translate-x-1.5"
              >
                →
              </span>
            </span>
            <SimLabel className="!text-[10px] sm:hidden" />
          </div>
        </div>
      </Link>
    </Spotlight>
  );
}
