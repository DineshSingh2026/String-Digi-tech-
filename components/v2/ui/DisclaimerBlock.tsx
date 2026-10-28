import { DISCLAIMER } from "@/content/copy";

export default function DisclaimerBlock({ className = "" }: { className?: string }) {
  return (
    <aside className={`rounded-xl border border-line bg-surface p-6 text-[14px] leading-relaxed text-muted ${className}`}>
      {DISCLAIMER}
    </aside>
  );
}
