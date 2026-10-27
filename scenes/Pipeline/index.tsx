"use client";
import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rng } from "@/lib/sim/rng";
import type { SceneProps } from "@/scenes/engine/types";
import { CONFIG } from "./config";
import { pipelineBus } from "./bus";

const vert = /* glsl */ `
uniform float uTime;
uniform float uCy;
uniform float uSpread;
uniform float uDpr;
uniform float uFlash;
attribute vec4 aSeed; // x phase, y lane, z speed, w kind (0 muted, 1 signal)
varying float vA;
varying float vKind;
void main() {
  float x = fract(aSeed.x + uTime * aSeed.z) * 2.4 - 1.2;
  float y = uCy + aSeed.y * uSpread + sin(x * 3.0 + aSeed.x * 20.0 + uTime * 0.6) * 0.025;
  float edge = smoothstep(1.2, 0.85, abs(x));
  vA = edge * (0.25 + 0.75 * (1.0 - abs(aSeed.y))) * (1.0 + uFlash * aSeed.w);
  vKind = aSeed.w;
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = (1.5 + 2.0 * (1.0 - abs(aSeed.y))) * uDpr;
}
`;

const frag = /* glsl */ `
uniform vec3 uMuted;
uniform vec3 uSignal;
uniform float uOpacity;
varying float vA;
varying float vKind;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float a = (1.0 - smoothstep(0.1, 0.5, r)) * vA * uOpacity * 0.3;
  gl_FragColor = vec4(mix(uMuted, uSignal, vKind) * a, 1.0);
  #include <colorspace_fragment>
}
`;

/**
 * Pipeline ambient scene: a soft horizontal stream of work items flowing left to right behind the DOM track panel.
 * The readable track (nodes, gates, labels) is DOM/canvas in components/sections/Pipeline.tsx, so nothing here can
 * collide with text. One draw call, all motion in the vertex shader.
 */
export default function Pipeline({ opacity, tier, calm }: SceneProps) {
  const dpr = useThree((s) => s.viewport.dpr);
  const count = tier === 1 ? Math.round(CONFIG.count / 2) : CONFIG.count;
  const geo = useMemo(() => {
    const r = rng(CONFIG.seed);
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const lane = (r() + r() + r()) / 1.5 - 1; // roughly gaussian in [-1,1]
      seed.set([r(), lane, CONFIG.speed[0] + r() * (CONFIG.speed[1] - CONFIG.speed[0]), r() < CONFIG.signalShare ? 1 : 0], i * 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uCy: { value: -0.15 },
          uSpread: { value: CONFIG.spread },
          uDpr: { value: 1 },
          uFlash: { value: 0 },
          uOpacity: { value: 0 },
          uMuted: { value: new THREE.Color(CONFIG.colors.muted) },
          uSignal: { value: new THREE.Color(CONFIG.colors.signal) },
        },
      }),
    [],
  );
  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => () => mat.dispose(), [mat]);

  const state = useMemo(() => ({ releases: pipelineBus.releases, flash: 0 }), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05) * (calm ? 0.5 : 1);
    const u = mat.uniforms;
    u.uTime!.value += dt;
    u.uOpacity!.value = opacity;
    u.uDpr!.value = dpr;
    if (pipelineBus.releases !== state.releases) {
      state.releases = pipelineBus.releases;
      state.flash = 1;
    }
    state.flash = Math.max(0, state.flash - dt * 1.5);
    u.uFlash!.value = state.flash;
    if (pipelineBus.hh > 0) {
      u.uCy!.value += (pipelineBus.cy - (u.uCy!.value as number)) * 0.2;
      u.uSpread!.value = Math.max(0.12, pipelineBus.hh * 0.9);
    }
  });

  return <points frustumCulled={false} geometry={geo} material={mat} />;
}
