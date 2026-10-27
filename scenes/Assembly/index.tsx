"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneProps } from "@/scenes/engine/types";
import { rng } from "@/lib/sim";
import { readSceneRect, rectProgressOf } from "@/scenes/engine/scene-store";
import { rectToWorld } from "@/scenes/engine/layout";
import { usePointer } from "@/scenes/engine/usePointer";
import { CONFIG, assemblyDrive, panelDelay, type PanelKind } from "./config";

type Built = { lines: THREE.BufferGeometry; solids: THREE.BufferGeometry; role: THREE.Color };

const C = {
  outline: new THREE.Color(CONFIG.colors.outline),
  inner: new THREE.Color(CONFIG.colors.inner),
  signal: new THREE.Color(CONFIG.colors.signal).multiplyScalar(1.7),
  accent: new THREE.Color(CONFIG.colors.accent).multiplyScalar(1.5),
  caution: new THREE.Color(CONFIG.colors.caution).multiplyScalar(1.3),
  risk: new THREE.Color(CONFIG.colors.risk).multiplyScalar(1.4),
  neutral: new THREE.Color(CONFIG.colors.neutral),
};
const KPI_TONES = [C.signal, C.caution, C.accent];

/**
 * Builds one dashboard module: crisp line work (vertex colours) + additive solid fills whose colours are
 * pre-multiplied by their alpha (black = transparent under additive blending). Each role gets its own accent.
 */
function buildPanel(kind: PanelKind, w: number, h: number, r: () => number, variant: number): Built {
  const lp: number[] = [];
  const lc: number[] = [];
  const sp: number[] = [];
  const sc: number[] = [];
  const seg = (x0: number, y0: number, x1: number, y1: number, c: THREE.Color, k = 1) => {
    lp.push(x0, y0, 0, x1, y1, 0);
    lc.push(c.r * k, c.g * k, c.b * k, c.r * k, c.g * k, c.b * k);
  };
  const rect = (x0: number, y0: number, x1: number, y1: number, c: THREE.Color, k = 1) => {
    seg(x0, y0, x1, y0, c, k);
    seg(x1, y0, x1, y1, c, k);
    seg(x1, y1, x0, y1, c, k);
    seg(x0, y1, x0, y0, c, k);
  };
  const poly = (pts: number[], c: THREE.Color, k = 1) => {
    for (let i = 0; i + 3 < pts.length; i += 2) seg(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], c, k);
  };
  const tri = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number, c: THREE.Color, a: number, a2 = a) => {
    sp.push(ax, ay, -0.001, bx, by, -0.001, cx, cy, -0.001);
    sc.push(c.r * a, c.g * a, c.b * a, c.r * a2, c.g * a2, c.b * a2, c.r * a2, c.g * a2, c.b * a2);
  };
  const fill = (x0: number, y0: number, x1: number, y1: number, c: THREE.Color, a: number) => {
    tri(x0, y0, x1, y0, x1, y1, c, a);
    tri(x0, y0, x1, y1, x0, y1, c, a);
  };
  /** filled area under a polyline down to baseline yb, fading downwards */
  const area = (pts: number[], yb: number, c: THREE.Color, a: number) => {
    for (let i = 0; i + 3 < pts.length; i += 2) {
      const [x0, y0, x1, y1] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]];
      sp.push(x0, y0, -0.001, x1, y1, -0.001, x1, yb, -0.001, x0, y0, -0.001, x1, yb, -0.001, x0, yb, -0.001);
      for (const k of [a, a, 0, a, 0, 0]) sc.push(c.r * k, c.g * k, c.b * k);
    }
  };

  const hw = w / 2;
  const hh = h / 2;
  const pad = Math.min(w, h) * 0.12;
  const x0 = -hw + pad;
  const x1 = hw - pad;
  const y0 = -hh + pad;
  const y1 = hh - pad * 2;
  const walk = (n: number, lo: number, hi: number, drift: number) => {
    const pts: number[] = [];
    let v = 0.4;
    for (let i = 0; i < n; i++) {
      v = Math.min(0.95, Math.max(0.05, v + (r() - 0.5 + drift) * 0.25));
      pts.push(x0 + ((x1 - x0) * i) / (n - 1), lo + (hi - lo) * v);
    }
    return pts;
  };

  let role = C.neutral;
  let outline = C.outline;
  switch (kind) {
    case "kpi": {
      const tone = KPI_TONES[variant % KPI_TONES.length];
      role = tone;
      const mid = (y0 + y1) / 2;
      fill(x0, mid + pad * 0.1, x0 + (x1 - x0) * (0.35 + r() * 0.35), mid + pad * 0.55, C.outline, 0.35);
      const pts = walk(9, y0, mid - pad * 0.3, 0.06);
      area(pts, y0, tone, 0.18);
      poly(pts, tone);
      break;
    }
    case "chart": {
      role = C.signal;
      for (let i = 0; i < 4; i++) {
        const y = y0 + ((y1 - y0) * i) / 3;
        seg(x0, y, x1, y, C.inner, 0.8);
      }
      for (let i = 1; i < 6; i++) {
        const x = x0 + ((x1 - x0) * i) / 6;
        seg(x, y0, x, y1, C.inner, 0.35);
      }
      const pts = walk(40, y0 + (y1 - y0) * 0.08, y1, 0.05);
      area(pts, y0, C.signal, 0.16);
      poly(pts, C.signal);
      // last-value marker: dashed accent line + tick
      const ly = pts[pts.length - 1];
      for (let x = x0; x < x1; x += 0.08) seg(x, ly, Math.min(x1, x + 0.04), ly, C.accent, 0.7);
      fill(x1 - 0.02, ly - 0.025, x1 + pad * 0.6, ly + 0.025, C.accent, 0.9);
      break;
    }
    case "table": {
      role = C.neutral;
      const rows = 6;
      const hl = 2;
      for (let i = 0; i <= rows; i++) {
        const y = y1 - ((y1 - y0) * i) / rows;
        seg(x0, y, x1, y, i === 0 ? C.outline : C.inner, i === 0 ? 1 : 0.7);
      }
      const ra = y1 - ((y1 - y0) * hl) / rows;
      const rb = y1 - ((y1 - y0) * (hl + 1)) / rows;
      fill(x0, rb, x1, ra, C.signal, 0.14);
      rect(x0, rb, x1, ra, C.signal, 0.8);
      seg(x0 + (x1 - x0) * 0.4, y0, x0 + (x1 - x0) * 0.4, y1, C.inner, 0.6);
      seg(x0 + (x1 - x0) * 0.7, y0, x0 + (x1 - x0) * 0.7, y1, C.inner, 0.6);
      // status dots in the last column
      for (let i = 0; i < rows; i++) {
        const cy = y1 - ((y1 - y0) * (i + 0.5)) / rows;
        const cx = x0 + (x1 - x0) * 0.85;
        const s = 0.022;
        fill(cx - s, cy - s, cx + s, cy + s, i === 4 ? C.caution : i === hl ? C.signal : C.inner, 0.9);
      }
      break;
    }
    case "alert": {
      role = C.risk;
      outline = C.risk;
      fill(-hw, -hh, -hw + 0.035, hh, C.risk, 0.9);
      const cy = (y0 + y1) / 2 + pad * 0.3;
      const t = (y1 - y0) * 0.45;
      const ax = x0 + pad * 0.3;
      tri(ax, cy - t, ax + 2 * t, cy - t, ax + t, cy + t, C.caution, 0.22);
      poly([ax, cy - t, ax + t, cy + t, ax + 2 * t, cy - t, ax, cy - t], C.caution);
      seg(ax + 3 * t, cy + t * 0.4, x1, cy + t * 0.4, C.outline, 0.8);
      seg(ax + 3 * t, cy - t * 0.6, x1 - (x1 - x0) * 0.3, cy - t * 0.6, C.inner);
      break;
    }
    case "ticket": {
      role = C.accent;
      const fh = (y1 - y0) / 6;
      // buy / sell toggle
      const half = (x1 - x0) / 2;
      fill(x0, y1 - fh, x0 + half - 0.02, y1, C.signal, 0.18);
      rect(x0, y1 - fh, x0 + half - 0.02, y1, C.signal, 0.9);
      rect(x0 + half + 0.02, y1 - fh, x1, y1, C.inner);
      for (let i = 1; i < 4; i++) {
        const top = y1 - i * fh * 1.25 - fh * 0.2;
        rect(x0, top - fh, x1, top, C.inner);
        seg(x0 + pad * 0.4, top - fh / 2, x0 + (x1 - x0) * (0.3 + 0.1 * i), top - fh / 2, C.outline, 0.5);
      }
      // CTA bar
      fill(x0, y0, x1, y0 + fh, C.accent, 0.55);
      rect(x0, y0, x1, y0 + fh, C.accent);
      break;
    }
    case "bars": {
      role = C.neutral;
      const n = 6;
      const bw = (x1 - x0) / (n * 1.6);
      for (let i = 0; i < n; i++) {
        const bx = x0 + i * bw * 1.6 + bw * 0.3;
        const bh = (y1 - y0) * (0.2 + r() * 0.75);
        const c = i === 2 ? C.signal : i === 4 ? C.accent : C.inner;
        fill(bx, y0, bx + bw, y0 + bh, c, i === 2 || i === 4 ? 0.35 : 0.25);
        rect(bx, y0, bx + bw, y0 + bh, c);
      }
      seg(x0, y0, x1, y0, C.outline, 0.7);
      break;
    }
    case "spark": {
      role = C.caution;
      const mid = (y0 + y1) / 2;
      const a = walk(18, y0, mid, -0.02);
      const b = walk(18, mid, y1, 0.03);
      area(b, mid, C.signal, 0.12);
      poly(b, C.signal);
      poly(a, C.caution, 0.9);
      seg(x0, mid, x1, mid, C.inner, 0.5);
      break;
    }
  }
  rect(-hw, -hh, hw, hh, outline, kind === "alert" ? 1 : 0.9);
  seg(-hw + pad, hh - pad, -hw + pad + w * 0.25, hh - pad, C.outline, 0.6);

  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
  lines.setAttribute("color", new THREE.Float32BufferAttribute(lc, 3));
  const solids = new THREE.BufferGeometry();
  solids.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  solids.setAttribute("color", new THREE.Float32BufferAttribute(sc, 3));
  return { lines, solids, role };
}

const easeLoop = (t: number) => THREE.MathUtils.clamp(0.5 - 0.65 * Math.cos(t), 0, 1);

/* glass back plate: faint vertical gradient + edge glow that flares when the module locks */
const PLATE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const PLATE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uGlow;
uniform vec2 uSize;
varying vec2 vUv;
void main() {
  vec2 d = min(vUv, 1.0 - vUv) * uSize;
  float e = min(d.x, d.y);
  float edge = exp(-e * 60.0);
  float g = 0.55 + 0.45 * vUv.y;
  gl_FragColor = vec4(uColor, uOpacity * g + edge * uGlow);
}
`;

export default function Assembly({ opacity, progress, tier, calm }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const panelRefs = useRef<(THREE.Group | null)[]>([]);
  const pointer = usePointer();
  // tier 1 drops two decorative KPI tiles; the core modules stay. Keep original indices for lock order.
  const panels = useMemo(
    () =>
      CONFIG.panels
        .map((p, idx) => ({ p, idx }))
        .filter(({ p, idx }) => tier !== 1 || p[0] !== "kpi" || idx === 0),
    [tier],
  );

  const built = useMemo(() => {
    const r = rng(CONFIG.seed);
    const n = panels.length;
    let kpi = 0;
    const parts = panels.map(({ p }) => buildPanel(p[0], p[3], p[4], r, p[0] === "kpi" ? kpi++ : 0));
    const plates = panels.map(({ p }) => new THREE.PlaneGeometry(p[3], p[4]));
    const scatter = new Float32Array(n * 6);
    const { x, y, z, rot } = CONFIG.scatter;
    for (let i = 0; i < n; i++) {
      scatter[i * 6] = x[0] + r() * (x[1] - x[0]);
      scatter[i * 6 + 1] = y[0] + r() * (y[1] - y[0]);
      scatter[i * 6 + 2] = z[0] + r() * (z[1] - z[0]);
      scatter[i * 6 + 3] = (r() - 0.5) * 2 * rot;
      scatter[i * 6 + 4] = (r() - 0.5) * 2 * rot;
      scatter[i * 6 + 5] = (r() - 0.5) * 2 * rot * 0.5;
    }
    const delay = Float32Array.from(panels.map(({ idx }) => panelDelay(idx)));
    return { parts, plates, scatter, delay, value: new Float32Array(n), vel: new Float32Array(n), flash: new Float32Array(n) };
  }, [panels]);

  const mats = useMemo(
    () =>
      panels.map(({ p }, i) => ({
        line: new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
        solid: new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
        plate: new THREE.ShaderMaterial({
          vertexShader: PLATE_VERT,
          fragmentShader: PLATE_FRAG,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uColor: { value: built.parts[i].role.clone() },
            uOpacity: { value: 0 },
            uGlow: { value: 0 },
            uSize: { value: new THREE.Vector2(p[3], p[4]) },
          },
        }),
      })),
    [panels, built],
  );

  useEffect(
    () => () => {
      built.parts.forEach((b) => {
        b.lines.dispose();
        b.solids.dispose();
      });
      built.plates.forEach((g) => g.dispose());
    },
    [built],
  );
  useEffect(
    () => () =>
      mats.forEach((m) => {
        m.line.dispose();
        m.solid.dispose();
        m.plate.dispose();
      }),
    [mats],
  );

  const clock = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });

  useFrame((state, rawDt) => {
    const g = groupRef.current;
    const inner = innerRef.current;
    if (!g || !inner) return;
    g.visible = opacity > 0.002;
    if (!g.visible) return;
    const dt = Math.min(rawDt, 0.05);
    clock.current += dt * (calm ? 0.4 : 1);
    const time = clock.current;
    const ptr = pointer(dt);

    const b = CONFIG.bounds;
    let drive: number;
    let lp = 0.5;
    const rect = readSceneRect("Assembly");
    if (rect) {
      const box = rectToWorld(rect, state.camera as THREE.PerspectiveCamera);
      const s = Math.min((box.w * CONFIG.fit) / b.w, (box.h * CONFIG.fit) / b.h);
      g.scale.setScalar(s);
      g.position.set(box.cx, box.cy, 0);
      lp = rectProgressOf(rect);
      drive = assemblyDrive(lp);
    } else {
      g.scale.setScalar(1);
      g.position.set(b.cx, b.cy, 0);
      drive = progress > 0.001 ? progress : easeLoop((time / CONFIG.loopPeriod) * Math.PI * 2);
    }
    inner.position.set(-b.cx, -b.cy, 0);

    // parallax: gentle tilt toward the pointer, plus a slow scroll-linked pitch
    const px = ptr.x > 1.5 ? 0 : ptr.x;
    const py = ptr.y > 1.5 ? 0 : ptr.y;
    const k = Math.min(1, dt * 3);
    tilt.current.y += (px * CONFIG.tilt - tilt.current.y) * k;
    tilt.current.x += (-py * CONFIG.tilt * 0.6 + (lp - 0.5) * 0.25 - tilt.current.x) * k;
    g.rotation.set(tilt.current.x, tilt.current.y - 0.06, 0);

    const { stiffness, damping } = CONFIG.spring;
    for (let i = 0; i < panels.length; i++) {
      const obj = panelRefs.current[i];
      if (!obj) continue;
      const target = THREE.MathUtils.clamp((drive * (1 + CONFIG.delaySpread) - built.delay[i]) / CONFIG.window, 0, 1);
      const a = stiffness * (target - built.value[i]) - damping * built.vel[i];
      built.vel[i] += a * dt;
      built.value[i] += built.vel[i] * dt;
      const kv = built.value[i];
      if (target >= 1 && kv > 0.97 && built.flash[i] === 0) built.flash[i] = 1;
      if (target < 0.9) built.flash[i] = 0;
      const fl = built.flash[i] > 0 ? Math.max(0.0001, built.flash[i] - dt * 1.2) : 0;
      built.flash[i] = fl;
      const p = panels[i].p;
      const sc = built.scatter;
      const bob = calm ? 0 : Math.sin(time * 0.8 + i * 1.7) * CONFIG.bob * (1 - kv);
      obj.position.set(
        sc[i * 6] + (p[1] - sc[i * 6]) * kv,
        sc[i * 6 + 1] + (p[2] - sc[i * 6 + 1]) * kv + bob,
        sc[i * 6 + 2] * (1 - kv) + p[5] * kv,
      );
      const rk = 1 - kv;
      obj.rotation.set(sc[i * 6 + 3] * rk, sc[i * 6 + 4] * rk, sc[i * 6 + 5] * rk);
      const kc = THREE.MathUtils.clamp(kv, 0, 1);
      const fe = fl * fl;
      mats[i].line.opacity = CONFIG.opacity * opacity * (0.2 + 0.8 * kc + fe * 0.5);
      mats[i].solid.opacity = opacity * (0.15 + 0.85 * kc);
      mats[i].plate.uniforms.uOpacity.value = opacity * (0.015 + 0.02 * kc + fe * 0.06);
      mats[i].plate.uniforms.uGlow.value = opacity * (0.05 * kc + fe * 0.6);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        {built.parts.map((part, i) => (
          <group
            key={`${panels.length}-${i}`}
            ref={(m: THREE.Group | null) => {
              panelRefs.current[i] = m;
            }}
          >
            <mesh geometry={built.plates[i]} material={mats[i].plate} position={[0, 0, -0.004]} />
            <mesh geometry={part.solids} material={mats[i].solid} />
            <lineSegments geometry={part.lines} material={mats[i].line} />
          </group>
        ))}
      </group>
    </group>
  );
}
