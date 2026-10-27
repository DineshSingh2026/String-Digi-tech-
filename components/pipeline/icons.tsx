type IconProps = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Research: document under a magnifier. */
export function ResearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h4" />
      <path d="M14 3.5 18.5 8v2.5" />
      <path d="M14 3.5V8h4.5" />
      <path d="M8.5 11h4M8.5 14h2.5" />
      <circle cx="16.25" cy="16.25" r="3" />
      <path d="m18.4 18.4 2.1 2.1" />
    </svg>
  );
}

/** Signal modelling: waveform with sample points. */
export function SignalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 12c1.6 0 2-5.5 3.8-5.5S8.7 17.5 10.5 17.5 12.6 9 14.2 9s1.9 6 3.6 6 1.9-3 3.7-3" />
      <circle cx="6.3" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.2" cy="9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Backtesting: clock with a history arrow. */
export function BacktestIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.2 13.2A8 8 0 1 0 6 6.6" />
      <path d="M3.5 4v3.5H7" />
      <path d="M12 8v4.2l2.8 1.8" />
    </svg>
  );
}

/** Risk controls: shield with a level line. */
export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 19 5.8v5.4c0 4.4-3 7.9-7 9.3-4-1.4-7-4.9-7-9.3V5.8L12 3Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </svg>
  );
}

/** Execution: lightning bolt. */
export function BoltIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13.2 2.8 5.5 13.2h5.6l-1 8 7.9-10.6h-5.7l.9-7.8Z" />
    </svg>
  );
}

/** Monitoring: eye with a pulse trace. */
export function MonitorIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <path d="M7.5 12h2l1.2-2.4 2 4.8 1.3-2.4h2.5" />
    </svg>
  );
}

/** Human reviewer glyph. */
export function ReviewerIcon({ className }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={16} height={16} strokeWidth={1.4} className={className}>
      <circle cx="8" cy="5.6" r="2.4" />
      <path d="M3.4 13.4c.6-2.4 2.4-3.6 4.6-3.6s4 1.2 4.6 3.6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={12} height={12} strokeWidth={1.8} className={className}>
      <path d="m3.5 8.3 2.8 2.7 6.2-6.3" />
    </svg>
  );
}

export function LoopIcon({ className }: IconProps) {
  return (
    <svg {...base} viewBox="0 0 16 16" width={12} height={12} strokeWidth={1.5} className={className}>
      <path d="M13 8a5 5 0 1 1-1.6-3.7" />
      <path d="M13 2.5v2.8h-2.8" />
    </svg>
  );
}

export const STAGE_ICONS = [ResearchIcon, SignalIcon, BacktestIcon, ShieldIcon, BoltIcon, MonitorIcon] as const;
