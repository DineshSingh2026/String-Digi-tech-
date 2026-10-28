type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Small orange check in a soft circle, for checklists. */
export function CheckBadge({ className = "" }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent ${className}`}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
        <path d="M3.5 8.5l3 3 6-7" {...stroke} strokeWidth={2} />
      </svg>
    </span>
  );
}

export function ArrowRight({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" {...stroke} />
    </svg>
  );
}

export function ChevronRight({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M6 3.5L10.5 8 6 12.5" {...stroke} />
    </svg>
  );
}

export function ServerIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="6.5" rx="1.5" {...stroke} />
      <rect x="3.5" y="13.5" width="17" height="6.5" rx="1.5" {...stroke} />
      <path d="M7 7.25h.01M7 16.75h.01M11 7.25h5M11 16.75h5" {...stroke} strokeWidth={2} />
    </svg>
  );
}

export function ChartIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 4v16h16" {...stroke} />
      <path d="M7.5 15l3.5-4 3 2.5 5-6" {...stroke} />
    </svg>
  );
}

export function FlowIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" {...stroke} />
      <circle cx="18" cy="12" r="2.5" {...stroke} />
      <circle cx="6" cy="18" r="2.5" {...stroke} />
      <path d="M8.5 6.5c4 0 4 4.5 7 5M8.5 17.5c4 0 4-4.5 7-5" {...stroke} />
    </svg>
  );
}

export function ShieldIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3.5l7 2.75v5.5c0 4.25-2.9 7.6-7 8.75-4.1-1.15-7-4.5-7-8.75v-5.5L12 3.5z" {...stroke} />
      <path d="M9 12l2.2 2.2L15.5 10" {...stroke} />
    </svg>
  );
}

export function LoopIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M13 6.5A5 5 0 0 0 3.6 5M3 9.5A5 5 0 0 0 12.4 11" {...stroke} />
      <path d="M3.2 2.5v2.8H6M12.8 13.5v-2.8H10" {...stroke} />
    </svg>
  );
}

export function PinIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 18s5.5-5.2 5.5-9.5a5.5 5.5 0 1 0-11 0C4.5 12.8 10 18 10 18z" {...stroke} />
      <circle cx="10" cy="8.5" r="2" {...stroke} />
    </svg>
  );
}

export function IdIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" {...stroke} />
      <path d="M6 8.5h4M6 11.5h7" {...stroke} />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" {...stroke} />
      <path d="M3 5.5l7 5.5 7-5.5" {...stroke} />
    </svg>
  );
}

export function PhoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M5.5 3h2.2l1.1 3.3-1.6 1.1a9 9 0 0 0 5.4 5.4l1.1-1.6 3.3 1.1v2.2A1.5 1.5 0 0 1 15.5 16 12.5 12.5 0 0 1 4 4.5 1.5 1.5 0 0 1 5.5 3z"
        {...stroke}
      />
    </svg>
  );
}
