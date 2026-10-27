"use client";

/**
 * Lightweight client wrapper: scene band observation, tier detection and poster fallback.
 * The WebGL stage (three + R3F) is code-split and only loaded on capable devices.
 */
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSceneStore, registerSceneRect } from "./scene-store";
import { detectTier } from "./gpu-tier";
import { isSceneName, type SceneName } from "./types";
import ScenePoster from "./ScenePoster";

const GLStage = dynamic(() => import("./GLStage"), { ssr: false, loading: () => null });

/** Bands without data-scene (or data-scene="None") resolve to null: the canvas fades to empty. */
function sceneOf(el: Element | null): SceneName | null {
  const v = el?.getAttribute("data-scene");
  return isSceneName(v) ? v : null;
}

/** Scene bands plus every top-level page section (so scene-less sections clear the canvas). */
const BAND_SELECTOR = "[data-scene], main > section";

function useSceneObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const store = useSceneStore.getState();
    const visible = new Set<Element>();
    let els: Element[] = [];
    let activeEl: Element | null = null;
    let raf = 0;
    let scanRaf = 0;

    const updateProgress = () => {
      raf = 0;
      const name = sceneOf(activeEl);
      if (!activeEl || !name) return;
      const r = activeEl.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = (vh - r.top) / (vh + r.height);
      useSceneStore.getState().setProgress(name, Math.max(0, Math.min(1, p)));
    };
    const requestProgress = () => {
      if (!raf) raf = requestAnimationFrame(updateProgress);
    };

    const pick = () => {
      if (visible.size > 0) {
        const mid = window.innerHeight / 2;
        let best: Element | null = null;
        let bestD = Infinity;
        visible.forEach((el) => {
          const r = el.getBoundingClientRect();
          const d = Math.abs((r.top + r.bottom) / 2 - mid);
          if (d < bestD) {
            bestD = d;
            best = el;
          }
        });
        activeEl = best;
      } else if (activeEl && !activeEl.isConnected) {
        activeEl = els[0] ?? null;
      } else if (!activeEl) {
        activeEl = els[0] ?? null;
      }
      const active = sceneOf(activeEl);
      let next: SceneName | null = null;
      const idx = activeEl ? els.indexOf(activeEl) : -1;
      for (let i = idx + 1; i < els.length; i++) {
        const n = sceneOf(els[i]);
        if (n && n !== active) {
          next = n;
          break;
        }
      }
      syncRect();
      store.setScenes(active, next);
      requestProgress();
    };

    /**
     * data-scene-rect (see scene-store.ts): the ACTIVE band's rect is registered for its scene, so two
     * bands sharing a scene (e.g. a page hero and a later band) each get their own layout. A scene that
     * is fading out keeps the rect it had while active.
     */
    function syncRect() {
      const n = sceneOf(activeEl);
      if (n && activeEl) registerSceneRect(n, activeEl.querySelector("[data-scene-rect]"));
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        pick();
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );

    const scan = () => {
      scanRaf = 0;
      const found = Array.from(document.querySelectorAll(BAND_SELECTOR));
      if (found.length === els.length && found.every((el, i) => el === els[i])) {
        syncRect(); // a data-scene-rect may have mounted inside the active band
        return;
      }
      io.disconnect();
      visible.clear();
      els = found;
      if (activeEl && !found.includes(activeEl)) activeEl = null;
      found.forEach((el) => io.observe(el));
      pick();
    };
    const requestScan = () => {
      if (!scanRaf) scanRaf = requestAnimationFrame(scan);
    };

    activeEl = null;
    scan();
    const mo = new MutationObserver(requestScan);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", requestProgress);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", requestProgress);
      window.removeEventListener("resize", requestProgress);
      if (raf) cancelAnimationFrame(raf);
      if (scanRaf) cancelAnimationFrame(scanRaf);
    };
  }, [pathname]);
}

function useEnvironment() {
  useEffect(() => {
    const store = useSceneStore.getState();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => store.setReducedMotion(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const onVis = () => store.setHidden(document.visibilityState === "hidden");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    let alive = true;
    if (!useSceneStore.getState().tierReady) {
      detectTier().then((t) => {
        if (alive) store.setTier(t);
      });
    }
    return () => {
      alive = false;
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}

export default function SceneCanvas() {
  useSceneObserver();
  useEnvironment();
  const active = useSceneStore((s) => s.activeScene);
  const tier = useSceneStore((s) => s.tier);
  const tierReady = useSceneStore((s) => s.tierReady);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const showGL = tierReady && tier > 0 && !reducedMotion;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {!showGL && active ? <ScenePoster scene={active} priority /> : null}
      {showGL ? <GLStage /> : null}
    </div>
  );
}
