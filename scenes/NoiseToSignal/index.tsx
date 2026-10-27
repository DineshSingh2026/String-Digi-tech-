"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneProps } from "@/scenes/engine/types";
import { readSceneRect, rectProgressOf } from "@/scenes/engine/scene-store";
import { rectToWorld } from "@/scenes/engine/layout";
import { clusterGen, rng } from "@/lib/sim";
import { CONFIG, phases } from "./config";

/* Points start as uniform noise (grey) and travel to their cluster; colour emerges as they are classified. */
const VERT = /* glsl */ `
attribute vec3 aTarget;
attribute vec3 aColor;
attribute float aDelay;
attribute float aNoise;
uniform float uProgress;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uStagger;
uniform float uJitter;
uniform vec2 uScale;
uniform vec3 uNoiseCol;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float k = clamp((uProgress - aDelay) / (1.0 - uStagger), 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  vec3 p = mix(position, aTarget, k);
  float j = uJitter * (1.0 - 0.7 * k);
  p.x += sin(uTime * 0.7 + aDelay * 91.0) * j;
  p.y += cos(uTime * 0.6 + aDelay * 57.0) * j;
  p.xy *= uScale;
  vColor = mix(uNoiseCol, aColor, k * (1.0 - aNoise));
  vAlpha = mix(0.55, 1.0, k) * mix(1.0, 0.28, aNoise * uProgress);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (7.0 / max(0.1, -mv.z)) * mix(0.85, 1.15, k * (1.0 - aNoise));
}
`;

const FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d);
  gl_FragColor = vec4(vColor, a * uOpacity * vAlpha);
}
`;

/* Ribbon (trend line + confidence band): aU along the curve, aSide -1..1 across it. */
const RIB_VERT = /* glsl */ `
attribute float aU;
attribute float aSide;
uniform vec2 uScale;
varying float vU;
varying float vSide;
void main() {
  vU = aU;
  vSide = aSide;
  vec3 p = position;
  p.xy *= uScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const LINE_FRAG = /* glsl */ `
uniform float uDraw;
uniform float uOpacity;
uniform vec3 uColor;
varying float vU;
varying float vSide;
void main() {
  if (vU > uDraw) discard;
  float s = abs(vSide);
  float core = 1.0 - smoothstep(0.12, 0.3, s);
  float glow = exp(-s * 4.5) * 0.45;
  float tip = smoothstep(uDraw - 0.04, uDraw, vU) * 0.6;
  float ends = smoothstep(0.0, 0.05, vU) * (1.0 - smoothstep(0.95, 1.0, vU));
  vec3 col = uColor * (1.0 + core * 0.9 + tip);
  gl_FragColor = vec4(col, (core + glow) * uOpacity * ends);
}
`;

const BAND_FRAG = /* glsl */ `
uniform float uDraw;
uniform float uOpacity;
uniform vec3 uColor;
varying float vU;
varying float vSide;
void main() {
  if (vU > uDraw) discard;
  float s = abs(vSide);
  float fill = pow(1.0 - s, 1.4);
  float edge = (1.0 - smoothstep(0.0, 0.025, 1.0 - s)) * 0.9;
  float lead = 1.0 - smoothstep(0.0, 0.06, uDraw - vU);
  float ends = smoothstep(0.0, 0.08, vU) * (1.0 - smoothstep(0.92, 1.0, vU));
  gl_FragColor = vec4(uColor, (fill * 0.55 + edge) * uOpacity * (1.0 - lead * 0.6) * ends);
}
`;

/* Centroid markers: px-sized ring sprites that appear once the clusters have formed. */
const RING_VERT = /* glsl */ `
uniform vec2 uScale;
uniform float uPixelRatio;
uniform float uSize;
void main() {
  vec3 p = position;
  p.xy *= uScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * uPixelRatio;
}
`;
const RING_FRAG = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float ring = 1.0 - smoothstep(0.0, 0.035, abs(d - 0.44));
  float dot = 1.0 - smoothstep(0.05, 0.08, d);
  float a = max(ring, dot);
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a * uOpacity);
}
`;

function ribbon(curve: THREE.Curve<THREE.Vector3>, S: number, halfW: (u: number) => number, z: number) {
  const pos = new Float32Array(S * 2 * 3);
  const aU = new Float32Array(S * 2);
  const aSide = new Float32Array(S * 2);
  const idx: number[] = [];
  const v = new THREE.Vector3();
  for (let i = 0; i < S; i++) {
    const u = i / (S - 1);
    curve.getPoint(u, v);
    const w = halfW(u);
    pos.set([v.x, v.y + w, z, v.x, v.y - w, z], i * 6);
    aU[i * 2] = u;
    aU[i * 2 + 1] = u;
    aSide[i * 2] = 1;
    aSide[i * 2 + 1] = -1;
    if (i < S - 1) {
      const o = i * 2;
      idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aU", new THREE.BufferAttribute(aU, 1));
  g.setAttribute("aSide", new THREE.BufferAttribute(aSide, 1));
  g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  return g;
}

export default function NoiseToSignal({ opacity, progress, tier, calm }: SceneProps) {
  const count = tier === 1 ? CONFIG.count / 2 : CONFIG.count;
  const groupRef = useRef<THREE.Group>(null);
  const smooth = useRef(-1);

  const built = useMemo(() => {
    const pts = clusterGen(CONFIG.seed, CONFIG.clusters, count);
    const n = pts.length;
    const pos = new Float32Array(n * 3);
    const tgt = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const delay = new Float32Array(n);
    const noiseA = new Float32Array(n);
    const c = new THREE.Color();
    const K = CONFIG.clusters;
    const sum = new Float64Array(K * 3);
    const sq = new Float64Array(K);
    const rnd = rng(CONFIG.seed + 1);
    // Re-seat the clusters along a gentle rising trend (sorted by x) so the fitted line reads as a trend,
    // not a zigzag: shift every point of cluster k by (slot_k - centroid_k).
    const raw = new Float64Array(K * 3);
    for (const p of pts) {
      if (p.cluster < 0 || p.cluster >= K) continue;
      raw[p.cluster * 3] += p.tx;
      raw[p.cluster * 3 + 1] += p.ty;
      raw[p.cluster * 3 + 2] += 1;
    }
    const order = Array.from({ length: K }, (_, k) => k)
      .filter((k) => raw[k * 3 + 2] > 0)
      .sort((a, b) => raw[a * 3] / raw[a * 3 + 2] - raw[b * 3] / raw[b * 3 + 2]);
    const shift = new Float64Array(K * 2);
    order.forEach((k, rank) => {
      const t = order.length > 1 ? rank / (order.length - 1) : 0.5;
      const sx = -0.72 + 1.44 * t;
      const sy = -0.5 + 0.95 * Math.pow(t, 1.25) + (rank % 2 ? 0.1 : -0.06);
      shift[k * 2] = sx - raw[k * 3] / raw[k * 3 + 2];
      shift[k * 2 + 1] = sy - raw[k * 3 + 1] / raw[k * 3 + 2];
    });
    for (const p of pts) {
      if (p.cluster < 0 || p.cluster >= K) continue;
      p.tx += shift[p.cluster * 2];
      p.ty += shift[p.cluster * 2 + 1];
    }
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const z = (rnd() - 0.5) * CONFIG.depth;
      pos.set([p.x, p.y, z], i * 3);
      tgt.set([p.tx, p.ty, p.cluster < 0 ? z : z * 0.2], i * 3);
      delay[i] = rnd() * CONFIG.staggerSpread;
      noiseA[i] = p.cluster < 0 ? 1 : 0;
      c.set(p.cluster < 0 ? CONFIG.colors.noise : CONFIG.clusterColors[p.cluster % CONFIG.clusterColors.length]);
      col.set([c.r, c.g, c.b], i * 3);
      if (p.cluster >= 0 && p.cluster < K) {
        sum[p.cluster * 3] += p.tx;
        sum[p.cluster * 3 + 1] += p.ty;
        sum[p.cluster * 3 + 2] += 1;
      }
    }
    for (let i = 0; i < n; i++) {
      const k = pts[i].cluster;
      if (k < 0 || k >= K || sum[k * 3 + 2] === 0) continue;
      const dx = pts[i].tx - sum[k * 3] / sum[k * 3 + 2];
      const dy = pts[i].ty - sum[k * 3 + 1] / sum[k * 3 + 2];
      sq[k] += dx * dx + dy * dy;
    }
    const cents: { x: number; y: number; s: number }[] = [];
    for (let k = 0; k < K; k++) {
      const m = sum[k * 3 + 2];
      if (m > 0) cents.push({ x: sum[k * 3] / m, y: sum[k * 3 + 1] / m, s: Math.sqrt(sq[k] / m) });
    }
    cents.sort((a, b) => a.x - b.x);
    const anchors = cents.length >= 2 ? cents : [{ x: -1, y: 0, s: 0.2 }, { x: 1, y: 0, s: 0.2 }];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(tgt, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
    geo.setAttribute("aNoise", new THREE.BufferAttribute(noiseA, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);

    // trend line through cluster centroids (extended slightly past the outer clusters)
    const first = anchors[0];
    const last = anchors[anchors.length - 1];
    const ctrl = [
      new THREE.Vector3(-1, first.y - (anchors[1].y - first.y) * 0.25, 0.05),
      ...anchors.map((q) => new THREE.Vector3(q.x, q.y, 0.05)),
      new THREE.Vector3(1, last.y + (last.y - anchors[anchors.length - 2].y) * 0.25, 0.05),
    ];
    const curve = new THREE.CatmullRomCurve3(ctrl, false, "centripetal", 0.5);
    const S = CONFIG.trendSamples;
    const spreadAt = (u: number) => {
      const f = u * (anchors.length - 1);
      const a = Math.floor(Math.min(f, anchors.length - 1));
      const b = Math.min(a + 1, anchors.length - 1);
      return anchors[a].s + (anchors[b].s - anchors[a].s) * (f - a);
    };
    const bandGeo = ribbon(curve, S, (u) => CONFIG.bandMin + CONFIG.bandScale * spreadAt(u) * (0.75 + 0.7 * Math.abs(u - 0.5)), 0.03);
    const lineGeo = ribbon(curve, S, () => CONFIG.lineWidth, 0.06);
    const ringPos = new Float32Array(anchors.length * 3);
    anchors.forEach((q, i) => ringPos.set([q.x, q.y, 0.07], i * 3));
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
    ringGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    return { geo, lineGeo, bandGeo, ringGeo };
  }, [count]);

  const mats = useMemo(() => {
    const uScale = { value: new THREE.Vector2(1, 1) };
    const uPixelRatio = { value: 1 };
    return {
      uScale,
      uPixelRatio,
      points: new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: CONFIG.pointSize },
          uPixelRatio,
          uOpacity: { value: 1 },
          uStagger: { value: CONFIG.staggerSpread },
          uJitter: { value: CONFIG.jitterAmp },
          uScale,
          uNoiseCol: { value: new THREE.Color(CONFIG.colors.noise) },
        },
      }),
      line: new THREE.ShaderMaterial({
        vertexShader: RIB_VERT,
        fragmentShader: LINE_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uDraw: { value: 0 }, uOpacity: { value: 1 }, uColor: { value: new THREE.Color(CONFIG.colors.signal) }, uScale },
      }),
      band: new THREE.ShaderMaterial({
        vertexShader: RIB_VERT,
        fragmentShader: BAND_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uDraw: { value: 0 }, uOpacity: { value: 1 }, uColor: { value: new THREE.Color(CONFIG.colors.signal) }, uScale },
      }),
      rings: new THREE.ShaderMaterial({
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uOpacity: { value: 0 }, uColor: { value: new THREE.Color(CONFIG.colors.text) }, uScale, uPixelRatio, uSize: { value: 30 } },
      }),
    };
  }, []);

  const objs = useMemo(
    () => ({
      points: new THREE.Points(built.geo, mats.points),
      line: new THREE.Mesh(built.lineGeo, mats.line),
      band: new THREE.Mesh(built.bandGeo, mats.band),
      rings: new THREE.Points(built.ringGeo, mats.rings),
    }),
    [built, mats],
  );

  useEffect(
    () => () => {
      built.geo.dispose();
      built.lineGeo.dispose();
      built.bandGeo.dispose();
      built.ringGeo.dispose();
    },
    [built],
  );
  useEffect(
    () => () => {
      mats.points.dispose();
      mats.line.dispose();
      mats.band.dispose();
      mats.rings.dispose();
    },
    [mats],
  );

  useFrame((state, rawDt) => {
    const g = groupRef.current;
    if (!g) return;
    g.visible = opacity > 0.002;
    if (!g.visible) return;
    const dt = Math.min(rawDt, 0.05);

    // fit to the band's data-scene-rect when present; otherwise the legacy right-half placement
    const r = readSceneRect("NoiseToSignal");
    let lp = progress;
    if (r) {
      const box = rectToWorld(r, state.camera as THREE.PerspectiveCamera);
      g.position.set(box.cx, box.cy, 0);
      mats.uScale.value.set((box.w / 2) * CONFIG.fill[0], (box.h / 2) * CONFIG.fill[1]);
      lp = rectProgressOf(r);
    } else {
      g.position.set(CONFIG.center[0], CONFIG.center[1], CONFIG.center[2]);
      mats.uScale.value.set(CONFIG.scale[0], CONFIG.scale[1]);
    }
    if (smooth.current < 0) smooth.current = lp;
    smooth.current += (lp - smooth.current) * Math.min(1, dt * 5);
    const ph = phases(smooth.current);

    mats.uPixelRatio.value = state.gl.getPixelRatio();
    const u = mats.points.uniforms;
    u.uProgress.value = ph.organise;
    u.uTime.value += dt * (calm ? 0.3 : 1);
    u.uOpacity.value = CONFIG.opacity.points * opacity;

    mats.line.uniforms.uDraw.value = ph.draw * 1.001;
    mats.band.uniforms.uDraw.value = ph.draw * 1.001;
    mats.line.uniforms.uOpacity.value = CONFIG.opacity.line * opacity * Math.min(1, ph.draw * 8);
    mats.band.uniforms.uOpacity.value = CONFIG.opacity.band * opacity * Math.min(1, ph.draw * 3);
    const ringIn = THREE.MathUtils.clamp((ph.organise - 0.75) / 0.25, 0, 1);
    mats.rings.uniforms.uOpacity.value = 0.55 * opacity * ringIn;
  });

  return (
    <group ref={groupRef}>
      <primitive object={objs.band} />
      <primitive object={objs.points} />
      <primitive object={objs.rings} />
      <primitive object={objs.line} />
    </group>
  );
}
