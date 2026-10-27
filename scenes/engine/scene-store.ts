import { create } from "zustand";
import type { SceneName, Tier } from "./types";

/**
 * Scene engine store.
 *
 * ── Which scene shows ────────────────────────────────────────────────────────────
 * Every `[data-scene]` element and every top-level `main > section` is a "band". The band whose
 * centre is closest to the viewport middle is active. If that band has no `data-scene`
 * attribute, or `data-scene="None"`, the canvas cross-fades to empty (no stray scene).
 *
 * ── Constraining a scene to a DOM region: `data-scene-rect` ─────────────────────
 * Put an element with the `data-scene-rect` attribute anywhere inside a scene band:
 *
 *   <Section scene="NodeMesh">
 *     <div data-scene-rect className="h-[520px]" />   // the globe is drawn inside this box
 *   </Section>
 *
 * When that band becomes active the observer registers it (first match inside the band) for the
 * band's scene, and scenes call `readSceneRect(name)` each
 * frame to get its live viewport rect (CSS px). Scenes that support it fit their content to the
 * box and scroll with it; without one they fall back to their default full-viewport layout.
 * Scenes supporting it: NoiseToSignal, NodeMesh, Assembly, Bounded. Keep the element free of
 * transforms that animate (e.g. don't wrap it in <Reveal>) so the rect is stable, and don't give
 * it `backdrop-filter` (that would blur the scene behind it).
 * `rectProgress(name)` returns 0..1 as the box travels through the viewport (0.5 = centred).
 */
export type ViewRect = { x: number; y: number; w: number; h: number; vw: number; vh: number };

const rectEls: Partial<Record<SceneName, Element>> = {};

export function registerSceneRect(name: SceneName, el: Element | null) {
  if (el) rectEls[name] = el;
  else delete rectEls[name];
}

export function readSceneRect(name: SceneName): ViewRect | null {
  const el = rectEls[name];
  if (!el || !el.isConnected) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height, vw: window.innerWidth || 1, vh: window.innerHeight || 1 };
}

/** 0 when the rect's top meets the viewport bottom, 0.5 when centred, 1 when its bottom meets the top. */
export function rectProgressOf(r: { y: number; h: number; vh: number }): number {
  return Math.max(0, Math.min(1, (r.vh - r.y) / (r.vh + r.h)));
}

export function rectProgress(name: SceneName): number | null {
  const r = readSceneRect(name);
  return r ? rectProgressOf(r) : null;
}

/**
 * Tiny shared bus so the DOM monitoring panel (Infrastructure band) and the NodeMesh scene show the
 * same simulated incident. The panel writes; the scene reads and falls back to its own sim when stale.
 */
export const infraBus = { anomaly: -1, isolated: -1, stamp: 0 };

export type SceneState = {
  activeScene: SceneName | null;
  nextScene: SceneName | null;
  tier: Tier;
  tierReady: boolean;
  reducedMotion: boolean;
  hidden: boolean;
  /** Scroll progress 0..1 through each scene band, keyed by data-scene value. */
  scrollProgress: Partial<Record<SceneName, number>>;
  setScenes: (active: SceneName | null, next: SceneName | null) => void;
  setTier: (tier: Tier) => void;
  setReducedMotion: (v: boolean) => void;
  setHidden: (v: boolean) => void;
  setProgress: (scene: SceneName, p: number) => void;
};

export const useSceneStore = create<SceneState>((set, get) => ({
  activeScene: null,
  nextScene: null,
  tier: 1,
  tierReady: false,
  reducedMotion: false,
  hidden: false,
  scrollProgress: {},
  setScenes: (activeScene, nextScene) => {
    const s = get();
    if (s.activeScene !== activeScene || s.nextScene !== nextScene) set({ activeScene, nextScene });
  },
  setTier: (tier) => set({ tier, tierReady: true }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setHidden: (hidden) => set({ hidden }),
  setProgress: (scene, p) => {
    const prev = get().scrollProgress[scene];
    if (prev !== undefined && Math.abs(prev - p) < 0.002) return;
    set({ scrollProgress: { ...get().scrollProgress, [scene]: p } });
  },
}));
