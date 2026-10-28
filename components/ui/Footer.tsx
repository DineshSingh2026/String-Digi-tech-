import Link from "next/link";
import { company, DISCLAIMER, footer, home, nav, v2Ui } from "@/content/copy";
import Logo from "./Logo";

const LEGAL = new Set(["/legal/privacy", "/legal/terms", "/legal/disclaimer"]);

type FooterLink = { label: string; href: string };

function Column({ title, links }: { title: string; links: readonly FooterLink[] }) {
  return (
    <div>
      <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.1em] text-white">{title}</p>
      <ul className="flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[15px] text-white/70 transition-colors duration-200 hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const companyLinks = footer.links.filter((l) => !LEGAL.has(l.href) && !l.href.startsWith("/solutions"));
  const legalLinks = footer.links.filter((l) => LEGAL.has(l.href));

  return (
    <footer className="border-t border-white/10 bg-ink text-white/70">
      <div className="container-x pb-10 pt-20 lg:pt-24">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Link href="/" aria-label={company.wordmark} className="inline-block">
              <Logo variant="full" height={44} />
            </Link>
            <p className="mt-6 max-w-[44ch] text-[15px] leading-relaxed text-white/70">{home.hero.supporting}</p>
            <address className="mt-10 not-italic">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-white">{v2Ui.registeredOffice}</p>
              <p className="mt-3 text-[15px] text-white/85">{company.legalName}</p>
              <p className="mt-1 max-w-[36ch] text-[15px] leading-relaxed text-white/70">{company.address}</p>
              <p className="mt-1 text-[15px] text-white/70">
                {footer.uenLabel} <span className="num text-white/85">{company.uen}</span>
              </p>
            </address>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-12">
            <Column title={v2Ui.footerCols.solutions} links={nav.solutions} />
            <Column title={v2Ui.footerCols.company} links={companyLinks} />
            <Column title={v2Ui.footerCols.legal} links={legalLinks} />
          </nav>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="max-w-[120ch] text-[13px] leading-relaxed text-white/55">{DISCLAIMER}</p>
          <p className="mt-6 text-[13px] text-white/55">
            © {year} {company.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
