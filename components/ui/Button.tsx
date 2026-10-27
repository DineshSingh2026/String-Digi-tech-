import Link from "next/link";

type Props = { href: string; children: React.ReactNode; variant?: "primary" | "secondary"; className?: string };

export default function Button({ href, children, variant = "primary", className = "" }: Props) {
  const base =
    "group relative inline-flex h-12 items-center justify-center gap-2.5 overflow-hidden rounded-[10px] px-6 text-[15px] font-medium transition-[background-color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-ui)] active:translate-y-px";
  const styles =
    variant === "primary"
      ? "bg-accent text-black glow-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:bg-[#ff6a26] hover:shadow-[0_0_0_1px_rgba(244,78,4,0.5),0_14px_50px_-8px_rgba(244,78,4,0.75),inset_0_1px_0_rgba(255,255,255,0.35)]"
      : "border border-white/12 bg-white/[0.03] text-text backdrop-blur-sm hover:border-white/25 hover:bg-white/[0.07]";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {variant === "primary" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-[var(--ease-ui)] group-hover:left-[120%] group-hover:opacity-100 motion-reduce:hidden"
        />
      ) : null}
      <span className="relative">{children}</span>
      <span aria-hidden="true" className="relative transition-transform duration-200 ease-[var(--ease-ui)] group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
