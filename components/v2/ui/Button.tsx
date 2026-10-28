import Link from "@/components/v2/V2Link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light";
  className?: string;
};

/** primary: solid brand orange. secondary: outlined, for light backgrounds. light: white, for dark or photo backgrounds. */
export default function Button({ href, children, variant = "primary", className = "" }: Props) {
  const base =
    "group inline-flex h-12 items-center gap-2 rounded-lg px-6 text-[15px] font-semibold transition-colors duration-200";
  const styles = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    secondary: "border border-line bg-white text-text hover:border-text",
    light: "bg-white text-ink hover:bg-surface-2",
  }[variant];
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
