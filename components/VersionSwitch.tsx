"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { versionSwitch } from "@/content/copy";
import { fromV2, isV2Path, toV2 } from "@/lib/siteVersion";

/**
 * Floating Classic / Clean toggle shown on both designs. It links to the same page in the other
 * design. The two designs use separate root layouts, so a plain <a> (full page load) is intended.
 */
export default function VersionSwitch() {
  const pathname = usePathname() ?? "/";
  const onV2 = isV2Path(pathname);
  const base = fromV2(pathname);
  const options = [
    { key: "classic", label: versionSwitch.classic, href: base, active: !onV2 },
    { key: "clean", label: versionSwitch.clean, href: toV2(base), active: onV2 },
  ];

  // Lift the switch above the cookie banner while both would occupy the same corner (full-width banner on phones).
  const ref = useRef<HTMLElement>(null);
  const [lift, setLift] = useState(0);
  useEffect(() => {
    const update = () => {
      const self = ref.current;
      const banner = document.querySelector<HTMLElement>("[data-consent-banner]");
      if (!self || !banner) return setLift(0);
      const s = self.getBoundingClientRect();
      const b = banner.getBoundingClientRect();
      const sharesColumn = b.left < s.right && b.right > s.left;
      setLift(sharesColumn ? Math.max(0, Math.round(window.innerHeight - b.top - 10)) : 0);
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", update);
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav
      ref={ref}
      aria-label={versionSwitch.label}
      className="fixed bottom-5 right-5 z-[60] flex items-center gap-1 rounded-full p-1 text-[13px] font-semibold shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform duration-300"
      style={{
        background: "rgba(11,18,32,0.92)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(10px)",
        transform: lift ? `translateY(-${lift}px)` : undefined,
      }}
    >
      <span className="hidden pl-3 pr-1 text-[11px] font-medium uppercase tracking-[0.1em] sm:inline" style={{ color: "#9aa6b5" }}>
        {versionSwitch.label}
      </span>
      {options.map((o) => (
        <a
          key={o.key}
          href={o.href}
          aria-current={o.active ? "page" : undefined}
          className="rounded-full px-3.5 py-1.5 transition-colors duration-200"
          style={o.active ? { background: "#ffffff", color: "#0b1220" } : { color: "#e9eef3" }}
        >
          {o.label}
        </a>
      ))}
    </nav>
  );
}
