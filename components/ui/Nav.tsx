"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { company, home, nav } from "@/content/copy";
import Logo from "./Logo";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDdOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!ddOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDdOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ddOpen]);

  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(ddRef.current?.querySelectorAll<HTMLAnchorElement>("[role=menuitem]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    }
  };

  const solid = scrolled || mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200 ${
        solid
          ? "border-white/[0.07] bg-[#06080B]/70 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label={company.wordmark} className="flex shrink-0 items-center">
          <Logo variant="full" height={32} priority className="lg:hidden" />
          <Logo variant="full" height={42} priority className="hidden lg:block" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <div
            ref={ddRef}
            className="relative"
            onMouseEnter={() => setDdOpen(true)}
            onMouseLeave={() => setDdOpen(false)}
            onKeyDown={onMenuKey}
          >
            <button
              ref={btnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={ddOpen}
              aria-controls="nav-solutions"
              onClick={() => setDdOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setDdOpen(true);
                  requestAnimationFrame(() =>
                    ddRef.current?.querySelector<HTMLAnchorElement>("[role=menuitem]")?.focus(),
                  );
                }
              }}
              className="flex items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-text"
            >
              {nav.solutionsLabel}
              <span aria-hidden="true" className={`text-[10px] transition-transform ${ddOpen ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            <div
              id="nav-solutions"
              role="menu"
              hidden={!ddOpen}
              className="absolute left-1/2 top-full w-[440px] -translate-x-1/2 pt-3"
            >
              <div className="panel p-2">
                {nav.solutions.map((s) => {
                  const desc = home.services.tiles.find((t) => t.href === s.href)?.body;
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      role="menuitem"
                      className="group block rounded-[10px] px-3 py-2.5 transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05]"
                    >
                      <span className="flex items-center gap-2 text-[14px] font-medium text-text">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent/70 transition-colors group-hover:bg-accent" />
                        {s.label}
                        <span aria-hidden="true" className="ml-auto text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text">
                          →
                        </span>
                      </span>
                      {desc ? <span className="mt-1 line-clamp-2 pl-3.5 text-[12.5px] leading-snug text-muted">{desc}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          {nav.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className="text-[14px] text-muted transition-colors hover:text-text aria-[current=page]:text-text"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={nav.contact.href}
            className="inline-flex h-9 items-center rounded-[9px] bg-accent px-4 text-[14px] font-medium text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-[background-color,box-shadow] hover:bg-[#ff6a26] hover:shadow-[0_8px_30px_-8px_rgba(244,78,4,0.7)]"
          >
            {nav.contact.label}
          </Link>
        </nav>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? nav.menuClose : nav.menuOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span
            aria-hidden="true"
            className={`absolute h-px w-5 bg-text transition-transform ${mobileOpen ? "rotate-45" : "-translate-y-1.5"}`}
          />
          <span
            aria-hidden="true"
            className={`absolute h-px w-5 bg-text transition-transform ${mobileOpen ? "-rotate-45" : "translate-y-1.5"}`}
          />
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-bg lg:hidden"
      >
        <nav aria-label="Mobile" className="container-x flex flex-col gap-8 py-10">
          <div>
            <p className="eyebrow mb-4">{nav.solutionsLabel}</p>
            <ul className="flex flex-col">
              {nav.solutions.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="block border-t border-line py-4 font-display text-[24px]">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-col">
            {nav.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block border-t border-line py-4 font-display text-[24px]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={nav.contact.href}
            className="inline-flex h-12 items-center justify-center bg-accent px-6 font-medium text-black"
          >
            {nav.contact.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
