/**
 * Static poster fallback (tier 0 / reduced motion / pre-GL). Inline SVG drawn from seeded sim data,
 * so it is deterministic, server-renderable and costs no image request.
 */
import { priceGen, exposureGen, clusterGen, infraGen, rng, DEFAULT_SCHEDULE, type Regime } from "@/lib/sim";
import type { SceneName } from "./types";
import { COLORS } from "./layout";

export type { SceneName } from "./types";

const W = 1600;
const H = 900;
const X0 = 620;
const X1 = 1560;

const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

const cache = new Map<SceneName, React.ReactNode>();

function signalField(): React.ReactNode {
  const n = 160;
  const paths: number[][] = [];
  for (let i = 0; i < 40; i++) {
    const p = priceGen(1000 + i, [{ regime: i % 3 === 0 ? "highVol" : "trend", steps: n }]);
    paths.push(p.map((q) => Math.log(q.price / p[0].price)));
  }
  const env = (s: number) => 0.32 * (Math.sqrt(s) + 0.05);
  const sy = 300 / 0.34;
  const X = (s: number) => X0 + s * (X1 - X0);
  const top: [number, number][] = [];
  const bot: [number, number][] = [];
  for (let k = 0; k <= 40; k++) {
    const s = k / 40;
    top.push([X(s), 450 - env(s) * sy]);
    bot.unshift([X(s), 450 + env(s) * sy]);
  }
  let hi = -1;
  const lines = paths.map((y, i) => {
    const pts: [number, number][] = [];
    let breached = false;
    for (let t = 0; t <= n; t++) {
      const s = t / n;
      pts.push([X(s), 450 - y[t] * sy]);
      if (Math.abs(y[t]) > env(s)) {
        breached = true;
        break;
      }
    }
    if (!breached && hi < 0 && y[n] > 0.05) hi = i;
    return { pts, breached };
  });
  return (
    <>
      <polygon points={poly([...top, ...bot])} fill={COLORS.signal} fillOpacity={0.04} stroke={COLORS.muted} strokeOpacity={0.35} />
      {lines.map((l, i) =>
        i === hi ? null : (
          <polyline key={i} points={poly(l.pts)} fill="none" stroke={l.breached ? COLORS.muted : COLORS.text} strokeOpacity={l.breached ? 0.12 : 0.16} strokeWidth={1} />
        ),
      )}
      {hi >= 0 ? <polyline points={poly(lines[hi].pts)} fill="none" stroke={COLORS.accent} strokeWidth={1.6} /> : null}
    </>
  );
}

const REGIME_COLOR: Record<Regime, string> = {
  trend: COLORS.signal,
  meanRevert: COLORS.muted,
  highVol: COLORS.caution,
  thinLiquidity: COLORS.risk,
};

// Retired from render() (band now has DOM panels); kept for reference / reuse.
export function regimeMap(): React.ReactNode {
  const prices = priceGen(8675309, DEFAULT_SCHEDULE);
  const exp = exposureGen(prices, 0.1);
  const logs = prices.map((p) => Math.log(p.price));
  const lo = Math.min(...logs);
  const hi = Math.max(...logs);
  const n = prices.length;
  const X = (i: number) => X0 + (i / (n - 1)) * (X1 - X0);
  const segs: { c: string; pts: [number, number][] }[] = [];
  prices.forEach((p, i) => {
    const pt: [number, number] = [X(i), 400 - ((logs[i] - lo) / (hi - lo)) * 280];
    const last = segs[segs.length - 1];
    if (!last || last.c !== REGIME_COLOR[p.regime]) {
      segs.push({ c: REGIME_COLOR[p.regime], pts: last ? [last.pts[last.pts.length - 1], pt] : [pt] });
    } else last.pts.push(pt);
  });
  const expPts = exp.map((e, i) => [X(i), 560 - e.exposure * 90] as [number, number]);
  const ddPts = exp.map((e, i) => [X(i), 790 - (e.drawdown / 0.1) * 150 * 0.98] as [number, number]);
  const ph = Math.floor(n * 0.62);
  return (
    <>
      {segs.map((s, i) => (
        <polyline key={i} points={poly(s.pts)} fill="none" stroke={s.c} strokeWidth={1.4} strokeOpacity={0.85} />
      ))}
      <line x1={X0} x2={X1} y1={560} y2={560} stroke={COLORS.line} />
      <polyline points={poly(expPts)} fill="none" stroke={COLORS.text} strokeOpacity={0.7} />
      <line x1={X0} x2={X1} y1={790} y2={790} stroke={COLORS.line} />
      <line x1={X0} x2={X1} y1={640} y2={640} stroke={COLORS.caution} strokeDasharray="6 5" strokeOpacity={0.75} />
      <polyline points={poly(ddPts)} fill="none" stroke={COLORS.risk} strokeOpacity={0.85} />
      <line x1={X(ph)} x2={X(ph)} y1={100} y2={790} stroke={COLORS.muted} strokeOpacity={0.3} />
      <circle cx={X(ph)} cy={400 - ((logs[ph] - lo) / (hi - lo)) * 280} r={5} fill={COLORS.accent} />
    </>
  );
}

function bounded(): React.ReactNode {
  const pts: [number, number][] = [];
  for (let k = 0; k <= 200; k++) {
    const s = k / 200;
    const y = 0.5 * Math.sin(s * 5) + 0.3 * Math.sin(s * 11.3) + 0.2 * Math.sin(s * 2.1);
    pts.push([X0 + s * (X1 - X0), 450 - y * 0.55 * 117]);
  }
  const head = pts[156];
  return (
    <>
      <line x1={X0} x2={X1} y1={333} y2={333} stroke={COLORS.muted} strokeOpacity={0.55} strokeDasharray="7 5" />
      <line x1={X0} x2={X1} y1={567} y2={567} stroke={COLORS.muted} strokeOpacity={0.55} strokeDasharray="7 5" />
      <polyline points={poly(pts)} fill="none" stroke={COLORS.text} strokeOpacity={0.85} strokeWidth={1.4} />
      <circle cx={head[0]} cy={head[1]} r={4.5} fill={COLORS.accent} />
    </>
  );
}

function noiseToSignal(): React.ReactNode {
  const pts = clusterGen(42, 4, 520);
  const cx = (X0 + X1) / 2;
  const cols = [COLORS.signal, COLORS.text, COLORS.caution, COLORS.muted];
  return (
    <>
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={cx + p.tx * 400}
          cy={450 - p.ty * 360}
          r={p.cluster < 0 ? 1.4 : 2}
          fill={p.cluster < 0 ? COLORS.muted : cols[p.cluster % cols.length]}
          fillOpacity={p.cluster < 0 ? 0.25 : 0.6}
        />
      ))}
      <circle cx={cx + pts[3].tx * 400} cy={450 - pts[3].ty * 360} r={4} fill={COLORS.accent} />
    </>
  );
}

function nodeMesh(): React.ReactNode {
  const { nodes } = infraGen(7, 24);
  const cols = 6;
  const pos = nodes.map((_, i) => [X0 + 120 + (i % cols) * 150 + ((Math.floor(i / cols) % 2) * 75), 200 + Math.floor(i / cols) * 150] as [number, number]);
  const anomaly = 9;
  return (
    <>
      {pos.map((p, i) =>
        [i + 1, i + cols].filter((j) => j < pos.length && (j !== i + 1 || (i + 1) % cols !== 0)).map((j) => (
          <line key={`${i}-${j}`} x1={p[0]} y1={p[1]} x2={pos[j][0]} y2={pos[j][1]} stroke={COLORS.line} strokeWidth={1.2} />
        )),
      )}
      {pos.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === anomaly ? 7 : 5} fill={i === anomaly ? COLORS.accent : nodes[i].cpu > 0.5 ? COLORS.signal : COLORS.muted} fillOpacity={i === anomaly ? 1 : 0.6} />
      ))}
    </>
  );
}

export function pipeline(): React.ReactNode {
  const r = rng(11);
  const stages = 5;
  const w = (X1 - X0 - 60) / stages;
  return (
    <>
      <line x1={X0} x2={X1} y1={450} y2={450} stroke={COLORS.line} />
      {Array.from({ length: stages }, (_, i) => (
        <rect key={i} x={X0 + 30 + i * w + 14} y={380} width={w - 28} height={140} rx={6} fill="none" stroke={COLORS.muted} strokeOpacity={0.35} />
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={X0 + r() * (X1 - X0)} cy={450 + (r() - 0.5) * 100} r={1.6} fill={COLORS.text} fillOpacity={0.35} />
      ))}
      <circle cx={X0 + 30 + 3.5 * w} cy={450} r={5} fill={COLORS.accent} />
    </>
  );
}

function assembly(): React.ReactNode {
  const cx = (X0 + X1) / 2;
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => {
        const y = 640 - i * 70;
        return (
          <polygon
            key={i}
            points={poly([[cx - 260, y], [cx, y - 110], [cx + 260, y], [cx, y + 110]])}
            fill={COLORS.text}
            fillOpacity={0.02}
            stroke={i === 4 ? COLORS.accent : COLORS.muted}
            strokeOpacity={i === 4 ? 0.9 : 0.3}
          />
        );
      })}
    </>
  );
}

/** Quiet ambient backdrop: a faint accent glow and a soft signal glow, no data marks. */
function ambient(): React.ReactNode {
  return (
    <>
      <defs>
        <radialGradient id="poster-amb-a" cx="78%" cy="40%" r="45%">
          <stop offset="0" stopColor={COLORS.accent} stopOpacity="0.07" />
          <stop offset="1" stopColor={COLORS.accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="poster-amb-s" cx="30%" cy="75%" r="40%">
          <stop offset="0" stopColor={COLORS.signal} stopOpacity="0.04" />
          <stop offset="1" stopColor={COLORS.signal} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#poster-amb-a)" />
      <rect width={W} height={H} fill="url(#poster-amb-s)" />
    </>
  );
}

function render(scene: SceneName): React.ReactNode {
  switch (scene) {
    case "SignalField":
    case "SignalFieldCalm":
      return signalField();
    // These bands now carry their own DOM panels: keep the fallback to a quiet ambient glow.
    case "RegimeMap":
    case "Pipeline":
    case "ServiceTiles":
      return ambient();
    case "Bounded":
      return bounded();
    case "NoiseToSignal":
      return noiseToSignal();
    case "NodeMesh":
      return nodeMesh();
    case "Assembly":
      return assembly();
  }
}

export default function ScenePoster({ scene, priority, className }: { scene: SceneName; priority?: boolean; className?: string }) {
  let content = cache.get(scene);
  if (content === undefined) {
    content = render(scene);
    cache.set(scene, content);
  }
  const dim = scene === "ServiceTiles" ? 0.3 : scene === "SignalFieldCalm" ? 0.6 : 1;
  return (
    <svg
      className={className ?? "absolute inset-0 h-full w-full"}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false"
      data-priority={priority ? "true" : undefined}
      style={{ background: COLORS.bg, opacity: dim }}
    >
      {content}
    </svg>
  );
}
