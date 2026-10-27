"use client";
import { useEffect, useState, type RefObject } from "react";
import { rectProgressOf } from "./scene-store";

/**
 * DOM-side twin of rectProgress(): 0..1 as the element travels through the viewport (0.5 = centred).
 * Quantised to 1/100 so React only re-renders on visible change. Use for HTML overlays that should
 * stay in step with a scene drawn into a data-scene-rect box.
 */
export function useRectProgress(ref: RefObject<Element | null>): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const v = rectProgressOf({ y: r.top, h: r.height, vh: window.innerHeight || 1 });
      setP((prev) => (Math.abs(prev - v) >= 0.01 ? Math.round(v * 100) / 100 : prev));
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    return () => {
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return p;
}
