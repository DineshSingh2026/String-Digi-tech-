export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M5 10.5 8.5 14 15 6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Small round check badge in brand orange on a soft tint. */
export function CheckBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent ${className}`}>
      <CheckIcon className="h-4 w-4" />
    </span>
  );
}

export function LoopIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M15.5 8A6 6 0 0 0 4.6 6.2M4.5 12a6 6 0 0 0 10.9 1.8M4.3 3v3.4h3.4M15.7 17v-3.4h-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
