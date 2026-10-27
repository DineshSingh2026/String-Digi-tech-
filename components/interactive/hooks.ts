"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

/** Interval that runs only while active. */
export function useTicker(active: boolean, ms: number, fn: () => void): void {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => fnRef.current(), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
}

export function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Build an SVG polyline path from values scaled into a box. */
export function linePath(values: number[], w: number, h: number, min: number, max: number, pad = 2): string {
  if (values.length === 0) return "";
  const span = max - min || 1;
  const dx = values.length > 1 ? w / (values.length - 1) : 0;
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * dx).toFixed(1)},${(pad + (1 - (v - min) / span) * (h - 2 * pad)).toFixed(1)}`)
    .join("");
}

/** Tweens a number toward `target` (ease-out). Starts at target so SSR and hydration match. */
export function useAnimatedNumber(target: number, reduced: boolean, ms = 450): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const valueRef = useRef(target);
  useEffect(() => {
    if (reduced) {
      valueRef.current = target;
      setValue(target);
      return;
    }
    fromRef.current = valueRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const v = fromRef.current + (target - fromRef.current) * e;
      valueRef.current = v;
      setValue(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, ms]);
  return value;
}
