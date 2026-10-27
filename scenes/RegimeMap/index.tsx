"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneProps } from "@/scenes/engine/types";
import { CONFIG } from "./config";
import { regimeBus, REGIME_ORDER } from "./bus";
import { ambientVert, ambientFrag } from "./shaders";

const PALETTE = REGIME_ORDER.map((r) => new THREE.Color(CONFIG.regimeColors[r]));

/**
 * RegimeMap ambient scene. The chart itself is DOM (scenes/RegimeMap/RegimeChart.tsx) so it can never collide
 * with copy; this pass only lays a regime-coloured halo behind the chart panel, positioned from regimeBus.
 * One draw call.
 */
export default function RegimeMap({ opacity, progress }: SceneProps) {
  const size = useThree((s) => s.size);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ambientVert,
        fragmentShader: ambientFrag,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uColor: { value: PALETTE[0]!.clone() },
          uCenter: { value: new THREE.Vector2(0.35, 0) },
          uHalf: { value: new THREE.Vector2(0.5, 0.45) },
        },
      }),
    [],
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  useEffect(
    () => () => {
      mat.dispose();
      geo.dispose();
    },
    [mat, geo],
  );

  useFrame((_, dt) => {
    const u = mat.uniforms;
    u.uOpacity!.value = opacity;
    u.uTime!.value += Math.min(dt, 0.05);
    u.uAspect!.value = size.width / Math.max(1, size.height);
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 4);
    const target = PALETTE[regimeBus.regime] ?? PALETTE[0]!;
    (u.uColor!.value as THREE.Color).lerp(target, k);
    const c = u.uCenter!.value as THREE.Vector2;
    const h = u.uHalf!.value as THREE.Vector2;
    if (regimeBus.hw > 0) {
      c.lerp(new THREE.Vector2(regimeBus.cx, regimeBus.cy), 0.5);
      h.set(regimeBus.hw, regimeBus.hh);
    } else {
      c.set(0.35, 0.1 - progress * 0.2);
    }
  });

  return <mesh frustumCulled={false} geometry={geo} material={mat} renderOrder={0} />;
}
