"use client";

import Link from "@/components/v2/V2Link";
import { usePathname } from "next/navigation";
import { fromV2 } from "@/lib/siteVersion";
import { useEffect, useRef, useState } from "react";
import { company, home, nav } from "@/content/copy";
import Logo from "@/components/ui/Logo";

const linkBase =
  "rounded-md px-1 py-2 text-[15px] font-medium text-body transition-colors duration-200 hover:text-text aria-[current=page]:text-text";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const ddBtnRef = useRef<HTMLButtonElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const pathname = fromV2(usePathname() ?? "/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change.
  useEffect(() => {
    setMobileOpen(false);
    setDdOpen(false);
  }, [pathname]);

  // Lock page scroll behind the mobile menu; Escape closes it.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  // Dropdown: close on outside click or Escape.
  useEffect(() => {
    if (!ddOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDdOpen(false);
        ddBtnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ddOpen]);

  // Close the dropdown when keyboard focus leaves it.
  const onDdBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget;
    if (next instanceof Node && ddRef.current?.contains(next)) return;
    setDdOpen(false);
  };

  const solutionActive = pathname.startsWith("/solutions");

  // The header stays solid white with no backdrop-filter: a filter would become the
  // containing block of the fixed mobile menu and collapse it to the header's height.
  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white transition-[border-color,box-shadow] duration-200 ${
        scrolled || mobileOpen
          ? "border-line shadow-[0_6px_24px_-18px_rgba(15,23,32,0.35)]"
          : "border-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-[76px]">
        <Link href="/" aria-label={company.wordmark} className="flex shrink-0 items-center">
          <Logo variant="full" height={32} priority className="lg:hidden" />
          <Logo variant="full" height={40} priority className="hidden lg:block" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          <div
            ref={ddRef}
            className="relative"
            onMouseEnter={() => setDdOpen(true)}
            onMouseLeave={() => setDdOpen(false)}
            onBlur={onDdBlur}
          >
            <button
              ref={ddBtnRef}
              type="button"
              aria-expanded={ddOpen}
              aria-controls="nav-solutions"
              onClick={() => setDdOpen((v) => !v)}
              className={`${linkBase} flex items-center gap-1.5 ${solutionActive ? "text-text" : ""}`}
            >
              {nav.solutionsLabel}
              <Chevron open={ddOpen} />
            </button>
            <div
              id="nav-solutions"
              hidden={!ddOpen}
              className="absolute left-1/2 top-full w-[480px] -translate-x-1/2 pt-3"
            >
              <ul className="rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-28px_rgba(15,23,32,0.35)]">
                {nav.solutions.map((s) => {
                  const desc = home.services.tiles.find((t) => t.href === s.href)?.body;
                  return (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        aria-current={pathname === s.href ? "page" : undefined}
                        className="group block rounded-xl px-4 py-3.5 transition-colors duration-200 hover:bg-surface focus-visible:bg-surface"
                      >
                        <span className="flex items-center justify-between gap-3 text-[15px] font-semibold text-text">
                          {s.label}
                          <span
                            aria-hidden="true"
                            className="text-muted transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                          >
                            →
                          </span>
                        </span>
                        {desc ? (
                          <span className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-muted">{desc}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {nav.links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined} className={linkBase}>
              {l.label}
            </Link>
          ))}
          <Link
            href={nav.contact.href}
            aria-current={pathname === nav.contact.href ? "page" : undefined}
            className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
          >
            {nav.contact.label}
          </Link>
        </nav>

        <button
          ref={burgerRef}
          type="button"
          className="relative -mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-text lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? nav.menuClose : nav.menuOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span
            aria-hidden="true"
            className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-200 ${mobileOpen ? "rotate-45" : "-translate-y-[5px]"}`}
          />
          <span
            aria-hidden="true"
            className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-200 ${mobileOpen ? "-rotate-45" : "translate-y-[5px]"}`}
          />
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-white lg:hidden"
      >
        <nav aria-label="Mobile" className="container-x flex flex-col gap-10 pb-12 pt-8">
          <div>
            <p className="eyebrow mb-3">{nav.solutionsLabel}</p>
            <ul className="flex flex-col">
              {nav.solutions.map((s) => (
                <li key={s.href} className="border-b border-line">
                  <Link
                    href={s.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-4 font-display text-[21px] text-text"
                  >
                    {s.label}
                    <span aria-hidden="true" className="text-muted">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-col">
            {nav.links.map((l) => (
              <li key={l.href} className="border-b border-line first:border-t">
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-4 font-display text-[21px] text-text"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={nav.contact.href}
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 text-[16px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            {nav.contact.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
