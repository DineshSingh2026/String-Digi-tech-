import Link from "@/components/v2/V2Link";

/** Quiet inline link with an arrow, used for "Learn more". `stretch` makes the whole parent card clickable. */
export default function TextLink({
  href,
  children,
  srLabel,
  stretch = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  srLabel?: string;
  stretch?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group/link inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent transition-colors duration-200 hover:text-accent-hover ${
        stretch ? "after:absolute after:inset-0 after:rounded-[inherit] after:content-['']" : ""
      } ${className}`}
    >
      {children}
      {srLabel ? <span className="sr-only">: {srLabel}</span> : null}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover/link:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
