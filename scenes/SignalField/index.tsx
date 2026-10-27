"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneProps } from "@/scenes/engine/types";
import { COLORS, type PlotRect } from "@/scenes/engine/layout";
import { usePointer } from "@/scenes/engine/usePointer";
import { rng } from "@/lib/sim";
import { CONFIG } from "./config";
import { buildPaths } from "./data";
import { trailVert, trailFrag, bandVert, bandFrag } from "./shaders";

/** Hero framing: fan opens to the right of the copy. Calm (closing) framing: centred band behind the heading. */
function rectFor(aspect: number, calm: boolean): PlotRect {
  if (calm) {
    if (aspect < 1) return { x0: -1.15, x1: 1.1, yC: 0.02, yHalf: 0.36 };
    return { x0: -0.92, x1: 1.04, yC: 0.0, yHalf: 0.6 };
  }
  if (aspect < 1) return { x0: -1.0, x1: 1.08, yC: -0.42, yHalf: 0.34 };
  if (aspect < 1.4) return { x0: -0.45, x1: 1.04, yC: 0.04, yHalf: 0.6 };
  return { x0: 0.02, x1: 1.03, yC: 0.08, yHalf: 0.6 };
}

/**
 * SignalField: thousands of comet trails flowing along simulated price paths inside a luminous
 * drawdown envelope. Paths that leave the envelope flash red, turn grey and are clipped.
 * 2 draw calls: one instanced ribbon mesh (12k / 24k trails) + one full-screen envelope quad.
 */
export default function SignalField({ opacity, tier, calm = false }: SceneProps) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const tick = usePointer();
  const paths = useMemo(() => buildPaths(), []);
  const count = tier >= 2 ? CONFIG.particles.tier2 : CONFIG.particles.tier1;
  const vol = useRef(0);

  const texture = useMemo(() => {
    const t = new THREE.DataTexture(paths.data, paths.width, paths.height, THREE.RGBAFormat, THREE.FloatType);
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.needsUpdate = true;
    return t;
  }, [paths]);

  const geometry = useMemo(() => {
    const seg = CONFIG.segments;
    const g = new THREE.InstancedBufferGeometry();
    const nv = (seg + 1) * 2;
    // position.x = along-trail u (0 tail .. 1 head), position.y = side (-1 / +1).
    // Packed into `position` so a per-vertex attribute owns location 0 (ANGLE/D3D instancing quirk).
    const pos = new Float32Array(nv * 3);
    for (let i = 0; i <= seg; i++) {
      pos[i * 6] = i / seg;
      pos[i * 6 + 1] = -1;
      pos[i * 6 + 3] = i / seg;
      pos[i * 6 + 4] = 1;
    }
    const idx: number[] = [];
    for (let i = 0; i < seg; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    g.setIndex(idx);
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const aPath = new Float32Array(count);
    const aPhase = new Float32Array(count);
    const aJit = new Float32Array(count);
    const aDepth = new Float32Array(count);
    const rand = rng(98765);
    const hiN = Math.min(CONFIG.highlightParticles, Math.floor(count * 0.02));
    for (let i = 0; i < count; i++) {
      aPath[i] = i < hiN ? paths.highlight : Math.floor(rand() * paths.height);
      aPhase[i] = rand();
      aJit[i] = rand();
      // most trails sit "far" (dim), a few are near (bright): depth via brightness falloff
      aDepth[i] = i < hiN ? 1 : Math.pow(rand(), 2.4);
    }
    g.setAttribute("aPath", new THREE.InstancedBufferAttribute(aPath, 1));
    g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(aPhase, 1));
    g.setAttribute("aJit", new THREE.InstancedBufferAttribute(aJit, 1));
    g.setAttribute("aDepth", new THREE.InstancedBufferAttribute(aDepth, 1));
    g.instanceCount = count;
    return g;
  }, [count, paths]);

  const rect = rectFor(size.width / Math.max(1, size.height), calm);
  const yScale = rect.yHalf / (paths.envC * 1.05);
  const rectVec = useMemo(() => new THREE.Vector4(), []);
  rectVec.set(rect.x0, rect.x1, rect.yC, rect.yHalf);

  const trailMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: trailVert,
        defines: { TEX_W: paths.width.toFixed(1), TEX_H: paths.height.toFixed(1) },
        fragmentShader: trailFrag,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uPaths: { value: texture },

          uTime: { value: 0 },
          uSpeed: { value: CONFIG.speed },
          uYScale: { value: 1 },
          uDpr: { value: 1 },
          uWidth: { value: CONFIG.width },
          uTrail: { value: CONFIG.trail },
          uHighlight: { value: paths.highlight },
          uOpacity: { value: 0 },
          uVol: { value: 0 },
          uRect: { value: rectVec },
          uRes: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(3, 3) },
          uColNear: { value: new THREE.Color(COLORS.signal).lerp(new THREE.Color("#ffffff"), 0.45) },
          uColFar: { value: new THREE.Color(COLORS.signal).lerp(new THREE.Color("#4f8cff"), 0.25) },
          uColGrey: { value: new THREE.Color(COLORS.muted).multiplyScalar(0.7) },
          uColRisk: { value: new THREE.Color(COLORS.risk).multiplyScalar(1.6) },
          uColHi: { value: new THREE.Color(COLORS.accent).multiplyScalar(1.7) },
          uColHot: { value: new THREE.Color(COLORS.caution) },
        },
      }),
    [texture, paths, rectVec],
  );

  const bandMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: bandVert,
        fragmentShader: bandFrag,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uRect: { value: rectVec },
          uEnvC: { value: paths.envC },
          uYScale: { value: 1 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uColEdge: { value: new THREE.Color(COLORS.signal).lerp(new THREE.Color("#ffffff"), 0.3) },
          uColFill: { value: new THREE.Color(COLORS.signal) },
          uColOrigin: { value: new THREE.Color(COLORS.accent).lerp(new THREE.Color("#ffffff"), 0.35) },
        },
      }),
    [paths, rectVec],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => () => {
      trailMat.dispose();
      bandMat.dispose();
      texture.dispose();
    },
    [trailMat, bandMat, texture],
  );

  useFrame((_, dt) => {
    const p = tick(dt);
    const d = Math.min(dt, 0.1);
    const speed = calm ? CONFIG.calmFactor : 1;
    // volatility: baseline while the pointer is over the page, spikes with pointer speed, decays smoothly
    const present = p.x < 1.5 ? 0.35 : 0;
    const target = Math.min(1, present + Math.hypot(p.vx, p.vy) * 0.45);
    vol.current += (target - vol.current) * Math.min(1, d * (target > vol.current ? 8 : 1.5));
    const resX = size.width * dpr;
    const resY = size.height * dpr;

    const u = trailMat.uniforms;
    u.uTime.value += d * speed;
    u.uYScale.value = yScale;
    u.uDpr.value = dpr;
    u.uOpacity.value = opacity * (calm ? 0.8 : 1);
    u.uVol.value = calm ? vol.current * 0.5 : vol.current;
    (u.uRes.value as THREE.Vector2).set(resX, resY);
    (u.uMouse.value as THREE.Vector2).set(p.x, p.y);

    const b = bandMat.uniforms;
    b.uYScale.value = yScale;
    b.uOpacity.value = opacity * (calm ? 0.85 : 1);
    b.uTime.value = u.uTime.value;
    (b.uRes.value as THREE.Vector2).set(resX, resY);
  });

  return (
    <>
      <mesh frustumCulled={false} renderOrder={0} material={bandMat}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <mesh frustumCulled={false} renderOrder={1} geometry={geometry} material={trailMat} />
    </>
  );
}
