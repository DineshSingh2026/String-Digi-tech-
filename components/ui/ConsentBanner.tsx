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

  // Accept and Decline share identical styling so neither choice is nudged.
  const btn =
    "h-10 flex-1 rounded-lg border border-line bg-white px-4 text-[14px] font-semibold text-text transition-colors duration-200 hover:border-text hover:bg-surface";

  return (
    <div
      role="region"
      aria-label={interactive.consentBanner.ariaLabel}
      className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line bg-white p-5 shadow-[0_24px_60px_-20px_rgba(15,23,32,0.35)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[380px]"
    >
      <p className="text-[14px] leading-relaxed text-body">
        {consent.text}{" "}
        <Link
          href="/legal/privacy"
          className="font-medium text-text underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          {consent.policy}
        </Link>
      </p>
      <div className="mt-4 flex gap-2.5">
        <button type="button" className={btn} onClick={() => choose("declined")}>
          {consent.decline}
        </button>
        <button type="button" className={btn} onClick={() => choose("accepted")}>
          {consent.accept}
        </button>
      </div>
    </div>
  );
}
