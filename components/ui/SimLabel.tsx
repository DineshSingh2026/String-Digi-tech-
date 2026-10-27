import { SIM_LABEL } from "@/content/copy";

export default function SimLabel({ text = SIM_LABEL, className = "" }: { text?: string; className?: string }) {
  return (
    <p className={`mono flex items-start gap-2 text-[11px] uppercase leading-relaxed tracking-[0.12em] text-muted ${className}`}>
      <span aria-hidden="true" className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full border border-caution/80" />
      <span>{text}</span>
    </p>
  );
}
