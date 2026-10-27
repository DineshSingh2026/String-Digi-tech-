"use client";

import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from "react";
import { useFrame } from "@react-three/fiber";
import { useSceneStore } from "./scene-store";
import type { SceneName, SceneProps, Tier } from "./types";

type Entry = { Comp: LazyExoticComponent<ComponentType<SceneProps>>; calm?: boolean; dim?: number };

const SignalField = lazy(() => import("@/scenes/SignalField"));
const RegimeMap = lazy(() => import("@/scenes/RegimeMap"));
const Pipeline = lazy(() => import("@/scenes/Pipeline"));
const NoiseToSignal = lazy(() => import("@/scenes/NoiseToSignal"));
const NodeMesh = lazy(() => import("@/scenes/NodeMesh"));
const Assembly = lazy(() => import("@/scenes/Assembly"));
const Bounded = lazy(() => import("@/scenes/Bounded"));
const Empty = lazy(async () => ({ default: function EmptyScene(): null { return null; } }));

/** Scene contract: scenes/<Name>/index.tsx default-exports ({opacity, progress, tier, calm}: SceneProps). */
export const REGISTRY: Record<SceneName, Entry> = {
  SignalField: { Comp: SignalField },
  SignalFieldCalm: { Comp: SignalField, calm: true },
  RegimeMap: { Comp: RegimeMap },
  Pipeline: { Comp: Pipeline },
  NoiseToSignal: { Comp: NoiseToSignal },
  NodeMesh: { Comp: NodeMesh },
  Assembly: { Comp: Assembly },
  Bounded: { Comp: Bounded },
  // Service tiles render their own 2D canvases: nothing behind them (a dim Bounded line used to leak through).
  ServiceTiles: { Comp: Empty },
};

const FADE_MS = 700;
const ease = (x: number) => x * x * (3 - 2 * x);

function Slot({
  name,
  target,
  leaving,
  tier,
  progress,
  onGone,
}: {
  name: SceneName;
  target: number;
  leaving: boolean;
  tier: Tier;
  progress: number;
  onGone: (n: SceneName) => void;
}) {
  const [opacity, setOpacity] = useState(0);
  const cur = useRef(0);
  const gone = useRef(false);
  useFrame((_, dt) => {
    const step = (Math.min(dt, 0.1) * 1000) / FADE_MS;
    const c = cur.current;
    const n = target > c ? Math.min(target, c + step) : Math.max(target, c - step);
    if (n !== c) {
      cur.current = n;
      setOpacity(ease(n));
      gone.current = false;
    } else if (leaving && n === 0 && !gone.current) {
      gone.current = true;
      onGone(name);
    }
  });
  const e = REGISTRY[name];
  const Comp = e.Comp;
  return (
    <group visible={opacity > 0.001}>
      <Suspense fallback={null}>
        <Comp opacity={opacity * (e.dim ?? 1)} progress={progress} tier={tier} calm={e.calm} />
      </Suspense>
    </group>
  );
}

/** Mounts only the active scene, the preloaded next scene, and any scene still fading out. */
export default function SceneRegistry() {
  const active = useSceneStore((s) => s.activeScene);
  const next = useSceneStore((s) => s.nextScene);
  const tier = useSceneStore((s) => s.tier);
  const progressMap = useSceneStore((s) => s.scrollProgress);
  const [leaving, setLeaving] = useState<SceneName[]>([]);
  const prev = useRef<SceneName | null>(active);

  useEffect(() => {
    const p = prev.current;
    prev.current = active;
    if (p && p !== active) setLeaving((l) => [...l.filter((n) => n !== p && n !== active), p]);
    else if (active) setLeaving((l) => (l.includes(active) ? l.filter((n) => n !== active) : l));
  }, [active]);

  const onGone = (n: SceneName) => setLeaving((l) => l.filter((x) => x !== n));

  const names: SceneName[] = [];
  for (const n of [active, next, ...leaving]) if (n && !names.includes(n)) names.push(n);

  return (
    <>
      {names.map((n) => (
        <Slot
          key={n}
          name={n}
          target={n === active ? 1 : 0}
          leaving={n !== active && n !== next}
          tier={tier}
          progress={progressMap[n] ?? 0}
          onGone={onGone}
        />
      ))}
    </>
  );
}
