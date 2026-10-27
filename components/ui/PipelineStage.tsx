export type StageTone = "muted" | "caution" | "signal" | "accent";

type Props = {
  index: number;
  label: string;
  gate?: boolean;
  gateLabel?: string;
  active?: boolean;
  status?: string;
  tone?: StageTone;
  statLabel?: string;
  statValue?: number;
  /** recent values for a tiny sparkline (non-gate stages) */
  spark?: readonly number[];
  /** 0..1 review progress (gate stages) */
  progress?: number;
  /** column = centred under a horizontal node; row = beside a vertical node */
  layout?: "column" | "row";
  className?: string;
  style?: React.CSSProperties;
};

const TONE: Record<StageTone, { text: string; dot: string; ring: string }> = {
  muted: { text: "text-muted", dot: "bg-muted", ring: "border-line" },
  caution: { text: "text-caution", dot: "bg-caution", ring: "border-caution/35" },
  signal: { text: "text-signal", dot: "bg-signal", ring: "border-signal/35" },
  accent: { text: "text-accent", dot: "bg-accent", ring: "border-accent/40" },
};

const r2 = (n: number) => Math.round(n * 100) / 100;

function Spark({ values, tone }: { values: readonly number[]; tone: StageTone }) {
  const W = 44;
  const H = 14;
  const max = Math.max(4, ...values);
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const pts = values.map((v, i) => `${r2(i * step)},${r2(H - 1 - (v / max) * (H - 3))}`).join(" ");
  const lastY = r2(H - 1 - ((values[values.length - 1] ?? 0) / max) * (H - 3));
  return (
    <svg width={W + 3} height={H} viewBox={`0 0 ${W + 3} ${H}`} aria-hidden="true" className={TONE[tone].text}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeOpacity={0.75} strokeWidth={1.2} strokeLinejoin="round" />
      <circle cx={W} cy={lastY} r={1.6} fill="currentColor" />
    </svg>
  );
}

function Meter({ value }: { value: number }) {
  return (
    <span aria-hidden="true" className="relative block h-[3px] w-11 overflow-hidden rounded-full bg-caution/15">
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-caution transition-[width] duration-300 ease-linear"
        style={{ width: `${r2(Math.min(1, Math.max(0, value)) * 100)}%` }}
      />
    </span>
  );
}

/** Stage label that sits under (or beside) its node on the lifecycle rail: number, name, status word, one live stat. */
export default function PipelineStage({
  index,
  label,
  gate = false,
  gateLabel,
  active = false,
  status,
  tone = gate ? "caution" : "muted",
  statLabel,
  statValue,
  spark,
  progress,
  layout = "column",
  className = "",
  style,
}: Props) {
  const col = layout === "column";
  const t = TONE[tone];
  return (
    <li style={style} className={`${className} flex min-w-0 flex-col ${col ? "items-center text-center" : "items-start text-left"}`}>
      <span className={`flex items-center gap-2 ${col ? "justify-center" : ""}`}>
        <span className={`mono text-[10px] tracking-[0.14em] transition-colors duration-500 ${active ? "text-accent" : "text-muted/70"}`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        {gate && gateLabel && !col ? (
          <span className="mono text-[9.5px] uppercase tracking-[0.14em] text-caution/80">· {gateLabel}</span>
        ) : null}
      </span>
      <span
        className={`font-display mt-1 text-[15px] font-medium leading-tight tracking-[-0.01em] transition-colors duration-500 xl:text-[16px] ${
          active ? "text-text" : "text-text/80"
        }`}
      >
        {label}
      </span>
      {status ? (
        <span
          className={`mono mt-2 inline-flex items-center gap-1.5 rounded-full border bg-bg/40 px-2 py-[3px] text-[9.5px] uppercase tracking-[0.14em] ${t.ring} ${t.text}`}
        >
          <span className={`h-1 w-1 rounded-full ${t.dot}`} aria-hidden="true" />
          {status}
        </span>
      ) : null}
      {statLabel !== undefined && statValue !== undefined ? (
        <span className={`mono mt-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-muted ${col ? "justify-center" : ""}`}>
          <span>{statLabel}</span>
          <span className={`tabular-nums ${gate ? "text-caution" : "text-text/90"}`}>{String(statValue).padStart(2, "0")}</span>
          {progress !== undefined ? <Meter value={progress} /> : spark ? <Spark values={spark} tone={tone} /> : null}
        </span>
      ) : null}
    </li>
  );
}
