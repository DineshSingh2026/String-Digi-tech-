"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneProps } from "@/scenes/engine/types";
import { infraBus, readSceneRect } from "@/scenes/engine/scene-store";
import { rectToWorld } from "@/scenes/engine/layout";
import { infraGen, rng } from "@/lib/sim";
import { CONFIG } from "./config";

/** Edge states: 0 normal, 1 isolated (dim), 2 reroute (bright, fast), 3 touching anomaly (red). */
const EDGE_VERT = /* glsl */ `
attribute float aT;
attribute float aPhase;
attribute float aState;
varying float vT;
varying float vPhase;
varying float vState;
varying float vFront;
uniform float uR;
void main() {
  vT = aT;
  vPhase = aPhase;
  vState = aState;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vFront = clamp((mv.z - c.z) / uR * 0.5 + 0.5, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;

const EDGE_FRAG = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform float uBase;
uniform vec3 uEdge;
uniform vec3 uSignal;
uniform vec3 uRisk;
varying float vT;
varying float vPhase;
varying float vState;
varying float vFront;
void main() {
  bool reroute = vState > 1.5 && vState < 2.5;
  float speed = reroute ? 2.6 : 1.0;
  float s = fract(uTime * speed + vPhase);
  float d = (vT - s) * 9.0;
  float pulse = exp(-d * d);
  // heartbeat gating: roughly a third of the edges carry a beat at any moment
  pulse *= step(0.62, fract(vPhase * 13.7 + floor(uTime * speed + vPhase) * 0.618));
  vec3 col = uEdge;
  float a = uBase;
  if (vState > 0.5 && vState < 1.5) { a *= 0.12; pulse = 0.0; }
  else if (reroute) { a *= 2.6; pulse = max(pulse * 1.4, 0.45); }
  else if (vState > 2.5) { col = uRisk * 1.6; a *= 3.0; pulse = 0.0; }
  col = mix(col, uSignal * 1.7, clamp(pulse, 0.0, 1.0));
  float depth = mix(0.22, 1.0, vFront);
  gl_FragColor = vec4(col, (a + pulse * 0.9) * uOpacity * depth);
}
`;

const NODE_VERT = /* glsl */ `
attribute vec3 aColor;
attribute float aSize;
uniform float uPx;
uniform float uPixelRatio;
uniform float uR;
varying vec3 vColor;
varying float vFront;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vFront = clamp((mv.z - c.z) / uR * 0.5 + 0.5, 0.0, 1.0);
  vColor = aColor;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPx * aSize * uPixelRatio * mix(0.55, 1.15, vFront);
}
`;
const NODE_FRAG = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vFront;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = 1.0 - smoothstep(0.16, 0.24, d);
  float halo = exp(-d * 9.0) * 0.55;
  gl_FragColor = vec4(vColor * (1.0 + core * 0.6), (core + halo) * uOpacity * mix(0.25, 1.0, vFront));
}
`;

/* Billboarded rings (anomaly shockwaves / isolation marker) and the soft atmosphere disc. */
const RING_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uWidth;
uniform float uDash;
varying vec2 vUv;
void main() {
  vec2 c = vUv - 0.5;
  float d = length(c);
  float ring = 1.0 - smoothstep(0.0, uWidth, abs(d - 0.46));
  if (uDash > 0.5) ring *= step(0.5, fract(atan(c.y, c.x) * 3.8197));
  gl_FragColor = vec4(uColor, ring * uOpacity);
}
`;
const ATMO_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float glow = exp(-pow(max(d - 0.62, 0.0) * 7.0, 2.0)) * smoothstep(1.0, 0.62, d);
  float rim = (1.0 - smoothstep(0.0, 0.012, abs(d - 0.72))) * 0.6;
  float inner = smoothstep(0.72, 0.0, d) * 0.035;
  gl_FragColor = vec4(uColor, (glow * 0.3 + rim * 0.7 + inner) * uOpacity);
}
`;
const UV_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function fibonacciSphere(n: number, radius: number, seed: number): Float32Array {
  const out = new Float32Array(n * 3);
  const r = rng(seed);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    const jitter = 1 + (r() - 0.5) * 0.1;
    out[i * 3] = Math.cos(th) * rad * radius * jitter;
    out[i * 3 + 1] = y * radius * jitter;
    out[i * 3 + 2] = Math.sin(th) * rad * radius * jitter;
  }
  return out;
}

function ringMat(color: string, width: number, dash: boolean) {
  return new THREE.ShaderMaterial({
    vertexShader: UV_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color).multiplyScalar(1.4) },
      uOpacity: { value: 0 },
      uWidth: { value: width },
      uDash: { value: dash ? 1 : 0 },
    },
  });
}

export default function NodeMesh({ opacity, progress, tier, calm }: SceneProps) {
  const count = tier === 1 ? CONFIG.count / 2 : CONFIG.count;
  const groupRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);
  const waveA = useRef<THREE.Mesh>(null);
  const waveB = useRef<THREE.Mesh>(null);
  const isoRing = useRef<THREE.Mesh>(null);
  const atmo = useRef<THREE.Mesh>(null);

  const built = useMemo(() => {
    const pos = fibonacciSphere(count, CONFIG.radius, CONFIG.seed);
    const key = new Set<number>();
    const edges: number[] = [];
    const adj: number[][] = Array.from({ length: count }, () => []);
    const dists = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        dists[j] = i === j ? Infinity : dx * dx + dy * dy + dz * dz;
      }
      const sorted = Array.from({ length: count }, (_, j) => j).sort((a, b) => dists[a] - dists[b]);
      for (let k = 0; k < CONFIG.neighbours; k++) {
        const j = sorted[k];
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        const id = a * count + b;
        if (key.has(id)) continue;
        key.add(id);
        edges.push(a, b);
        adj[a].push(b);
        adj[b].push(a);
      }
    }
    const E = edges.length / 2;
    const r = rng(CONFIG.seed + 5);
    const ePos = new Float32Array(E * 6);
    const eT = new Float32Array(E * 2);
    const ePhase = new Float32Array(E * 2);
    const eState = new Float32Array(E * 2);
    for (let e = 0; e < E; e++) {
      const a = edges[e * 2];
      const b = edges[e * 2 + 1];
      ePos.set([pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2], pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]], e * 6);
      eT[e * 2] = 0;
      eT[e * 2 + 1] = 1;
      const ph = r();
      ePhase[e * 2] = ph;
      ePhase[e * 2 + 1] = ph;
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
    edgeGeo.setAttribute("aT", new THREE.BufferAttribute(eT, 1));
    edgeGeo.setAttribute("aPhase", new THREE.BufferAttribute(ePhase, 1));
    const stateAttr = new THREE.BufferAttribute(eState, 1);
    stateAttr.setUsage(THREE.DynamicDrawUsage);
    edgeGeo.setAttribute("aState", stateAttr);
    edgeGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CONFIG.radius * 2);

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const colAttr = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    colAttr.setUsage(THREE.DynamicDrawUsage);
    const sizeAttr = new THREE.BufferAttribute(new Float32Array(count).fill(1), 1);
    sizeAttr.setUsage(THREE.DynamicDrawUsage);
    nodeGeo.setAttribute("aColor", colAttr);
    nodeGeo.setAttribute("aSize", sizeAttr);
    nodeGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CONFIG.radius * 2);
    const plane = new THREE.PlaneGeometry(1, 1);
    return { pos, edges, adj, E, edgeGeo, stateAttr, nodeGeo, colAttr, sizeAttr, plane };
  }, [count]);

  const sim = useMemo(() => infraGen(CONFIG.seed, count), [count]);

  const mats = useMemo(
    () => ({
      nodes: new THREE.ShaderMaterial({
        vertexShader: NODE_VERT,
        fragmentShader: NODE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uPx: { value: CONFIG.nodePx }, uPixelRatio: { value: 1 }, uOpacity: { value: 1 }, uR: { value: CONFIG.radius } },
      }),
      edges: new THREE.ShaderMaterial({
        vertexShader: EDGE_VERT,
        fragmentShader: EDGE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 1 },
          uBase: { value: CONFIG.opacity.edges },
          uR: { value: CONFIG.radius },
          uEdge: { value: new THREE.Color(CONFIG.colors.edge) },
          uSignal: { value: new THREE.Color(CONFIG.colors.signal) },
          uRisk: { value: new THREE.Color(CONFIG.colors.risk) },
        },
      }),
      waveA: ringMat(CONFIG.colors.risk, 0.02, false),
      waveB: ringMat(CONFIG.colors.risk, 0.014, false),
      iso: ringMat(CONFIG.colors.caution, 0.03, true),
      atmo: new THREE.ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: ATMO_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(CONFIG.colors.signal) }, uOpacity: { value: 0 } },
      }),
    }),
    [],
  );

  const objs = useMemo(
    () => ({ edges: new THREE.LineSegments(built.edgeGeo, mats.edges), nodes: new THREE.Points(built.nodeGeo, mats.nodes) }),
    [built, mats],
  );

  const tmp = useMemo(
    () => ({
      v: new THREE.Vector3(),
      cNode: new THREE.Color(CONFIG.colors.node),
      cRisk: new THREE.Color(CONFIG.colors.risk).multiplyScalar(1.5),
      cSignal: new THREE.Color(CONFIG.colors.signal).multiplyScalar(1.3),
      cDim: new THREE.Color(CONFIG.colors.node).multiplyScalar(0.18),
      c: new THREE.Color(),
      lastKey: -2,
      time: 0,
      busFrom: -1,
      busTo: -1,
      eventStart: 0,
      lastFocus: -1,
    }),
    [],
  );

  useEffect(
    () => () => {
      built.edgeGeo.dispose();
      built.nodeGeo.dispose();
      built.plane.dispose();
    },
    [built],
  );
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
    [mats],
  );

  useFrame((state, rawDt) => {
    const g = groupRef.current;
    const root = rootRef.current;
    if (!g || !root || !waveA.current || !waveB.current || !isoRing.current || !atmo.current) return;
    g.visible = opacity > 0.002;
    if (!g.visible) return;
    const dt = Math.min(rawDt, 0.05) * (calm ? 0.5 : 1);
    tmp.time += dt;
    const time = tmp.time;

    // fit into the band's data-scene-rect when present
    const r = readSceneRect("NodeMesh");
    if (r) {
      const box = rectToWorld(r, state.camera as THREE.PerspectiveCamera);
      g.position.set(box.cx, box.cy, 0);
      g.scale.setScalar((Math.min(box.w, box.h) * CONFIG.fit) / (CONFIG.radius * 2));
    } else {
      g.position.set(CONFIG.center[0], CONFIG.center[1], CONFIG.center[2]);
      g.scale.setScalar(1);
    }

    root.rotation.y += dt * CONFIG.rotationSpeed;
    root.rotation.x = 0.3 + progress * 0.25;
    root.updateMatrixWorld();

    // incident source: the DOM monitoring panel when it is publishing, else our own sim
    let anomalyRaw = -1;
    let isolatedRaw = -1;
    if (performance.now() - infraBus.stamp < 1500) {
      anomalyRaw = infraBus.anomaly;
      isolatedRaw = infraBus.isolated;
    } else {
      const { nodes } = sim.step(dt * 500);
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].status === "anomaly") anomalyRaw = i;
        else if (nodes[i].status === "isolated") isolatedRaw = i;
      }
    }
    // map the incident onto a node currently facing the camera so it is always visible
    const raw = anomalyRaw >= 0 ? anomalyRaw : isolatedRaw;
    if (raw >= 0 && raw !== tmp.busFrom) {
      tmp.busFrom = raw;
      tmp.eventStart = time;
      let pick = raw % count;
      for (let k = 0; k < count; k++) {
        const i = (raw * 7 + k * 13) % count;
        tmp.v.set(built.pos[i * 3], built.pos[i * 3 + 1], built.pos[i * 3 + 2]).applyMatrix4(root.matrix);
        if (tmp.v.z > CONFIG.radius * 0.55 && Math.abs(tmp.v.y) < CONFIG.radius * 0.6) {
          pick = i;
          break;
        }
      }
      tmp.busTo = pick;
    }
    if (raw < 0) tmp.busFrom = -1;
    const anomaly = anomalyRaw >= 0 ? tmp.busTo : -1;
    const isolated = anomalyRaw < 0 && isolatedRaw >= 0 ? tmp.busTo : -1;

    const key = anomaly >= 0 ? anomaly : isolated >= 0 ? count + isolated : -1;
    if (key !== tmp.lastKey) {
      tmp.lastKey = key;
      const st = built.stateAttr.array as Float32Array;
      const nbr = isolated >= 0 ? built.adj[isolated] : null;
      for (let e = 0; e < built.E; e++) {
        const a = built.edges[e * 2];
        const b = built.edges[e * 2 + 1];
        let v = 0;
        if (anomaly >= 0 && (a === anomaly || b === anomaly)) v = 3;
        else if (isolated >= 0 && (a === isolated || b === isolated)) v = 1;
        else if (nbr && (nbr.includes(a) || nbr.includes(b))) v = 2;
        st[e * 2] = v;
        st[e * 2 + 1] = v;
      }
      built.stateAttr.needsUpdate = true;
    }

    const col = built.colAttr.array as Float32Array;
    const size = built.sizeAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      let sc = 1;
      if (i === anomaly) {
        const p = 0.5 + 0.5 * Math.sin(time * 16);
        tmp.c.copy(tmp.cRisk);
        sc = 2.4 + p * 1.2;
      } else if (i === isolated) {
        tmp.c.copy(tmp.cDim);
        sc = 1.4;
      } else if (isolated >= 0 && built.adj[isolated].includes(i)) {
        tmp.c.copy(tmp.cSignal);
        sc = 1.8;
      } else {
        tmp.c.copy(tmp.cNode);
      }
      col[i * 3] = tmp.c.r;
      col[i * 3 + 1] = tmp.c.g;
      col[i * 3 + 2] = tmp.c.b;
      size[i] = sc;
    }
    built.colAttr.needsUpdate = true;
    built.sizeAttr.needsUpdate = true;

    // rings: anomaly → two expanding shockwaves; isolated → static dashed caution ring
    const focus = anomaly >= 0 ? anomaly : isolated;
    const age = time - tmp.eventStart;
    const rings = [waveA.current, waveB.current, isoRing.current];
    if (focus >= 0) {
      tmp.v.set(built.pos[focus * 3], built.pos[focus * 3 + 1], built.pos[focus * 3 + 2]);
      root.localToWorld(tmp.v);
      g.worldToLocal(tmp.v);
      for (const m of rings) {
        m.position.copy(tmp.v);
        m.position.z += 0.02;
        m.quaternion.copy(state.camera.quaternion);
      }
    }
    if (anomaly >= 0) {
      const w1 = (age * 0.9) % 1;
      const w2 = (age * 0.9 + 0.5) % 1;
      waveA.current.visible = waveB.current.visible = true;
      waveA.current.scale.setScalar(0.15 + w1 * 0.75);
      waveB.current.scale.setScalar(0.15 + w2 * 0.75);
      mats.waveA.uniforms.uOpacity.value = (1 - w1) * CONFIG.opacity.ring * opacity;
      mats.waveB.uniforms.uOpacity.value = (1 - w2) * CONFIG.opacity.ring * opacity * 0.8;
    } else {
      waveA.current.visible = waveB.current.visible = false;
    }
    if (isolated >= 0) {
      isoRing.current.visible = true;
      isoRing.current.scale.setScalar(0.32);
      mats.iso.uniforms.uOpacity.value = CONFIG.opacity.ring * opacity * 0.9;
    } else {
      isoRing.current.visible = false;
    }

    atmo.current.quaternion.copy(state.camera.quaternion);
    mats.atmo.uniforms.uOpacity.value = CONFIG.opacity.halo * opacity;

    mats.nodes.uniforms.uPixelRatio.value = state.gl.getPixelRatio() * Math.max(0.7, g.scale.x);
    mats.nodes.uniforms.uOpacity.value = CONFIG.opacity.nodes * opacity;
    const u = mats.edges.uniforms;
    u.uTime.value = time * CONFIG.pulseSpeed;
    u.uOpacity.value = opacity;
  });

  const d = CONFIG.radius * 2;
  return (
    <group ref={groupRef}>
      <mesh ref={atmo} geometry={built.plane} material={mats.atmo} scale={d * 1.4} renderOrder={-1} />
      <group ref={rootRef}>
        <primitive object={objs.edges} />
        <primitive object={objs.nodes} />
      </group>
      <mesh ref={waveA} geometry={built.plane} material={mats.waveA} visible={false} renderOrder={2} />
      <mesh ref={waveB} geometry={built.plane} material={mats.waveB} visible={false} renderOrder={2} />
      <mesh ref={isoRing} geometry={built.plane} material={mats.iso} visible={false} renderOrder={2} />
    </group>
  );
}
