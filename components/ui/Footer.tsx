import Link from "next/link";
import { company, DISCLAIMER, footer, heroUi, home, nav } from "@/content/copy";
import Logo from "./Logo";

const LEGAL = new Set(["/legal/privacy", "/legal/terms", "/legal/disclaimer"]);

export default function Footer() {
  const year = new Date().getFullYear();
  const companyLinks = footer.links.filter((l) => !LEGAL.has(l.href) && !l.href.startsWith("/solutions"));
  const legalLinks = footer.links.filter((l) => LEGAL.has(l.href));
  const col = "mono mb-5 text-[11px] uppercase tracking-[0.14em] text-muted";
  const link = "text-[14px] text-text/75 transition-colors hover:text-text";

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/[0.07] bg-bg">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="container-x relative grid grid-cols-1 gap-12 pb-12 pt-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" aria-label={company.wordmark} className="inline-block">
            <Logo variant="full" height={48} />
          </Link>
          <p className="mt-6 max-w-[42ch] text-[14px] leading-relaxed text-muted">{home.hero.supporting}</p>
          <div className="mt-8 rounded-[12px] border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">{heroUi.footerOffice}</p>
            <p className="mt-2 text-[14px] text-text/85">{company.legalName}</p>
            <p className="mt-1 text-[14px] text-muted">{company.address}</p>
            <p className="mono mt-2 text-[12px] text-muted">
              {footer.uenLabel} <span className="text-text/85">{company.uen}</span>
            </p>
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7 md:pl-8">
          <div>
            <p className={col}>{heroUi.footerSolutions}</p>
            <ul className="flex flex-col gap-3">
              {nav.solutions.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={col}>{heroUi.footerCompany}</p>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={col}>{heroUi.footerLegal}</p>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="md:col-span-12">
          <div className="hairline mb-8" />
          <p className="max-w-[110ch] text-[12px] leading-relaxed text-muted">{DISCLAIMER}</p>
        </div>
      </div>

      <div className="relative border-t border-white/[0.06]">
        <div className="container-x mono flex flex-col gap-2 py-4 text-[11px] uppercase tracking-[0.12em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {company.legalName}
          </span>
          <span className="flex items-center gap-2">
            <span className="live-dot !h-1.5 !w-1.5" aria-hidden="true" />
            {heroUi.status} · {home.singapore.timezoneLabel}
          </span>
        </div>
      </div>
    </footer>
  );
}
