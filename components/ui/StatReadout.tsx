type Props = { label: string; value: string; unit?: string; tone?: "signal" | "risk" | "caution" | "text"; size?: "sm" | "lg" };

export default function StatReadout({ label, value, unit, tone = "text", size = "sm" }: Props) {
  const color = { signal: "text-signal", risk: "text-risk", caution: "text-caution", text: "text-text" }[tone];
  return (
    <div className="flex flex-col gap-1.5">
      <span className="mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className={`mono tabular-nums ${size === "lg" ? "text-[24px] leading-none" : "text-[14px]"} ${color}`}>
        {value}
        {unit ? <span className={`text-muted ${size === "lg" ? "ml-1 text-[12px]" : ""}`}> {unit}</span> : null}
      </span>
    </div>
  );
}
