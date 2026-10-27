import Link from "next/link";
import { company, pagesUi, type Link as Crumb } from "@/content/copy";

/** Visible mono breadcrumb trail. Home is prepended; the last crumb is the current page. */
export default function Trail({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  const trail: Crumb[] = [{ label: company.wordmark, href: "/" }, ...crumbs];
  return (
    <nav aria-label={pagesUi.breadcrumbAria} className={className}>
      <ol className="mono flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-muted">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.href + c.label} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-text">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="transition-colors hover:text-accent">
                  {c.label}
                </Link>
              )}
              {!last ? (
                <span aria-hidden="true" className="text-accent/70">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
