"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { consent, interactive } from "@/content/copy";
import { readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(readConsent() === null);
  }, []);

  if (!show) return null;

  const choose = (c: ConsentChoice) => {
    writeConsent(c);
    setShow(false);
  };

  const base = "mono h-10 flex-1 rounded-lg px-4 text-[12px] uppercase tracking-[0.1em] transition-colors duration-200";

  return (
    <div
      role="region"
      aria-label={interactive.consentBanner.ariaLabel}
      data-consent-banner=""
      style={{ position: "fixed" }}
      className="panel fixed inset-x-3 bottom-3 z-50 p-5 sm:inset-x-auto sm:left-5 sm:bottom-5 sm:w-[400px]"
    >
      <p className="flex gap-3 text-[14px] leading-relaxed text-muted">
        <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        <span>
          {consent.text}{" "}
          <Link href="/legal/privacy" className="text-text underline decoration-white/30 underline-offset-4 hover:text-accent hover:decoration-accent">
            {consent.policy}
          </Link>
        </span>
      </p>
      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          className={`${base} border border-white/15 text-text hover:border-white/35 hover:bg-white/[0.04]`}
          onClick={() => choose("declined")}
        >
          {consent.decline}
        </button>
        <button type="button" className={`${base} bg-accent font-semibold text-black hover:bg-[#ff6a26]`} onClick={() => choose("accepted")}>
          {consent.accept}
        </button>
      </div>
    </div>
  );
}
