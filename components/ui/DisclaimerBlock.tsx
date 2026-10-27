import { DISCLAIMER } from "@/content/copy";

export default function DisclaimerBlock({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`relative flex gap-4 overflow-hidden rounded-xl border border-caution/25 bg-[linear-gradient(135deg,rgba(245,165,36,0.07),rgba(12,16,22,0.8)_55%)] p-5 text-[14px] leading-relaxed text-muted md:p-6 ${className}`}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-caution" />
      <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-caution" aria-hidden="true">
        <path d="M10 2.5 18.5 17h-17Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8v4M10 14.2v.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <p>{DISCLAIMER}</p>
    </aside>
  );
}
