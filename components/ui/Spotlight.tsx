"use client";

import { useRef } from "react";

/** Wraps children in a card whose border + fill glow follow the cursor (see .spotlight in globals.css). */
export default function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onPointerMove={onMove} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
