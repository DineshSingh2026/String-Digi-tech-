"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneProps } from "@/scenes/engine/types";
import { COLORS, plotRect, rectToNdc } from "@/scenes/engine/layout";
import { readSceneRect } from "@/scenes/engine/scene-store";
import { CONFIG } from "./config";

const vert = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = /* glsl */ `
uniform vec2 uRes;
uniform vec4 uRect; // x0, x1, yCenter, limit (NDC)
uniform float uTime;
uniform float uOpacity;
uniform float uExc;
uniform float uHead;
uniform vec3 uColLine;
uniform vec3 uColGlow;
uniform vec3 uColLimit;
uniform vec3 uColAccent;
varying vec2 vNdc;

float lineY(float s, float t) {
  return 0.5 * sin(s * 5.0 + t * 0.35) + 0.3 * sin(s * 11.3 - t * 0.22) + 0.2 * sin(s * 2.1 + t * 0.15);
}

void main() {
  float s = (vNdc.x - uRect.x) / (uRect.y - uRect.x);
  if (s < -0.02 || s > 1.02) discard;
  float px = 2.0 / uRes.y;
  float fade = smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.94, 1.0, s));

  // line: bright up to the live head, a faint dotted projection after it
  float y = uRect.z + lineY(s, uTime) * uExc * uRect.w;
  float dLine = abs(vNdc.y - y) / px;
  float past = smoothstep(0.0, uHead, s);
  float future = 1.0 - step(s, uHead);
  float dots = step(fract(gl_FragCoord.x / 6.0), 0.5);
  float core = (1.0 - smoothstep(0.5, 1.6, dLine)) * mix(0.35 + 0.65 * past, 0.35 * dots, future);
  float glow = exp(-dLine * 0.09) * 0.22 * past * (1.0 - future);

  // limit lines (dashed) with a soft inner bloom, and a faint fill inside the corridor
  float yTop = uRect.z + uRect.w;
  float yBot = uRect.z - uRect.w;
  float dTop = abs(vNdc.y - yTop) / px;
  float dBot = abs(vNdc.y - yBot) / px;
  float dash = step(mod(gl_FragCoord.x, 14.0), 8.0);
  float lim = (1.0 - smoothstep(0.4, 1.3, min(dTop, dBot))) * dash * 0.7;
  float inside = step(yBot, vNdc.y) * step(vNdc.y, yTop);
  float limGlow = inside * (exp(-dTop * 0.06) + exp(-dBot * 0.06)) * 0.06;
  float fill = inside * 0.025;

  // faint vertical time grid
  float gx = abs(fract(s * 10.0 + 0.5) - 0.5) * (uRect.y - uRect.x) * 0.1 * uRes.x * 0.5;
  float grid = inside * (1.0 - smoothstep(0.3, 1.0, gx)) * 0.05;

  // live head + crosshair
  vec2 head = vec2(mix(uRect.x, uRect.y, uHead), uRect.z + lineY(uHead, uTime) * uExc * uRect.w);
  vec2 dh = (vNdc - head) * uRes * 0.5;
  float dHead = length(dh);
  float hd = (1.0 - smoothstep(3.5, 5.0, dHead)) + exp(-dHead * 0.08) * 0.35;
  float cross = inside * (1.0 - smoothstep(0.3, 1.0, abs(dh.x))) * 0.18;

  vec3 col = uColLine * core * 1.4 + uColGlow * (glow + fill + grid * 0.5) + uColLimit * (lim + limGlow) + uColAccent * (hd + cross);
  float a = clamp(core + glow + lim + limGlow + fill + grid + hd + cross, 0.0, 1.0) * fade * uOpacity;
  float sum = core * 1.4 + glow + fill + grid * 0.5 + lim + limGlow + hd + cross;
  gl_FragColor = vec4(col / max(sum, 1e-4) * (1.0 + hd * 0.6 + core * 0.3), a);
  #include <colorspace_fragment>
}
`;

/** Bounded: one full-screen shader quad (1 draw call). A calm luminous line held between two limit lines. */
export default function Bounded({ opacity, calm }: SceneProps) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uRes: { value: new THREE.Vector2(1, 1) },
          uRect: { value: new THREE.Vector4() },
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uExc: { value: CONFIG.excursion },
          uHead: { value: CONFIG.head },
          uColLine: { value: new THREE.Color(COLORS.text) },
          uColGlow: { value: new THREE.Color(COLORS.signal) },
          uColLimit: { value: new THREE.Color(COLORS.caution) },
          uColAccent: { value: new THREE.Color(COLORS.accent).multiplyScalar(1.6) },
        },
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame((_, dt) => {
    const u = mat.uniforms;
    u.uTime.value += Math.min(dt, 0.1) * CONFIG.speed * (calm ? CONFIG.calmFactor : 1) * 3;
    u.uOpacity.value = opacity;
    (u.uRes.value as THREE.Vector2).set(size.width * dpr, size.height * dpr);
    const r = readSceneRect("Bounded");
    if (r) {
      const n = rectToNdc(r);
      (u.uRect.value as THREE.Vector4).set(n.x0, n.x1, (n.y0 + n.y1) / 2, ((n.y1 - n.y0) / 2) * CONFIG.rectLimit);
    } else {
      const rect = plotRect(size.width / Math.max(1, size.height));
      // keep the full-viewport fallback clear of left-column headings on wide screens
      const x0 = size.width >= size.height ? Math.max(rect.x0, 0.05) : rect.x0;
      (u.uRect.value as THREE.Vector4).set(x0, rect.x1, rect.yC, CONFIG.limit);
    }
  });

  return (
    <mesh frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
