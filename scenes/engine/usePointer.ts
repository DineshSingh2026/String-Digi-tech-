"use client";

import { useEffect, useRef } from "react";

export type PointerState = { x: number; y: number; vx: number; vy: number; px: number; py: number };

/**
 * Window-level pointer tracking in NDC (the canvas is pointer-events:none).
 * Call `tick(dt)` once per frame to update the smoothed velocity.
 */
export function usePointer() {
  const s = useRef<PointerState>({ x: 2, y: 2, vx: 0, vy: 0, px: 2, py: 2 });
  const raw = useRef({ x: 2, y: 2 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      raw.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      raw.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);
  const tick = (dt: number) => {
    const st = s.current;
    const d = Math.max(dt, 1 / 240);
    const nx = raw.current.x;
    const ny = raw.current.y;
    const ivx = st.px > 1.5 ? 0 : (nx - st.px) / d;
    const ivy = st.py > 1.5 ? 0 : (ny - st.py) / d;
    const k = Math.min(1, dt * 6);
    st.vx += (Math.max(-4, Math.min(4, ivx)) - st.vx) * k;
    st.vy += (Math.max(-4, Math.min(4, ivy)) - st.vy) * k;
    st.px = nx;
    st.py = ny;
    st.x = nx;
    st.y = ny;
    return st;
  };
  return tick;
}
