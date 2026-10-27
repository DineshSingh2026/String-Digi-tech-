export type IconKind = "stack" | "chart" | "algo" | "shield" | "nodes" | "gate" | "code";

/** Line-art glyphs drawn on a 48px grid; decorative only. */
export default function Icon({ kind, className = "" }: { kind: IconKind; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {kind === "stack" ? (
        <g {...p}>
          <path d="M24 6 42 15 24 24 6 15Z" />
          <path d="M6 24l18 9 18-9" opacity={0.7} />
          <path d="M6 33l18 9 18-9" opacity={0.45} />
        </g>
      ) : null}
      {kind === "chart" ? (
        <g {...p}>
          <path d="M6 42h36" opacity={0.5} />
          <path d="M10 34V26M18 34V18M26 34V22M34 34V10" />
          <path d="M8 22 18 12l8 6 14-12" stroke="var(--accent)" />
        </g>
      ) : null}
      {kind === "algo" ? (
        <g {...p}>
          <circle cx="10" cy="24" r="4" />
          <circle cx="38" cy="12" r="4" />
          <circle cx="38" cy="36" r="4" />
          <path d="M14 24h8l12-10M22 24l12 10" />
          <circle cx="22" cy="24" r="2" fill="var(--accent)" stroke="var(--accent)" />
        </g>
      ) : null}
      {kind === "shield" ? (
        <g {...p}>
          <path d="M24 5 40 11v12c0 10-7 17-16 20C15 40 8 33 8 23V11Z" />
          <rect x="17" y="21" width="14" height="11" rx="2" stroke="var(--accent)" />
          <path d="M20 21v-3a4 4 0 0 1 8 0v3" stroke="var(--accent)" />
        </g>
      ) : null}
      {kind === "nodes" ? (
        <g {...p}>
          <rect x="6" y="6" width="14" height="14" rx="3" />
          <rect x="28" y="6" width="14" height="14" rx="3" />
          <rect x="6" y="28" width="14" height="14" rx="3" />
          <rect x="28" y="28" width="14" height="14" rx="3" stroke="var(--accent)" />
        </g>
      ) : null}
      {kind === "gate" ? (
        <g {...p}>
          <path d="M6 24h12M30 24h12" />
          <path d="M18 14v20M30 14v20" />
          <circle cx="24" cy="24" r="3" stroke="var(--accent)" />
        </g>
      ) : null}
      {kind === "code" ? (
        <g {...p}>
          <path d="M16 14 6 24l10 10M32 14l10 10-10 10" />
          <path d="M27 10 21 38" stroke="var(--accent)" />
        </g>
      ) : null}
    </svg>
  );
}
