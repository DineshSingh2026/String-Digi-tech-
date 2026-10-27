/**
 * Deterministic 1D flow simulation for the strategy-lifecycle diagram.
 * Positions are px along the main rail (0 = Research node, length = Monitoring node), so the same engine drives the
 * horizontal (desktop) and vertical (mobile) renderers. No randomness: identical input gives identical frames.
 */

export type Tuning = {
  /** base particle speed, px/s */
  speed: number;
  /** seconds between new work items entering at Research */
  interval: number;
  /** minimum spacing between items, also the queue spacing, px */
  spacing: number;
  /** review duration per gate, s (ring fill time) */
  review: readonly number[];
  /** time a gate stays open after a review completes, s */
  open: number;
  /** seconds for one refine item to travel the loop */
  arcDuration: number;
  /** seconds between refine items */
  arcInterval: number;
};

export type FlowGeometry = {
  /** px along the rail for each stage node */
  nodes: readonly number[];
  /** stage index of each review gate */
  gateStages: readonly number[];
  /** distance from a gate node to its stop line, px */
  gateGap: number;
};

export type Particle = { pos: number; v: number; boost: number; passed: number; queued: boolean };
export type GateMode = "idle" | "review" | "open";
export type Gate = {
  stage: number;
  stop: number;
  mode: GateMode;
  t: number;
  progress: number;
  queue: number;
  released: number;
  batch: number;
  /** seconds since the gate last opened (large when never) */
  since: number;
  /** eased 0..1 open amount for the barrier */
  openAmt: number;
};
export type ReleaseEvent = { gate: number; n: number };

export type Snapshot = {
  inFlight: number[];
  queue: number[];
  progress: number[];
  released: number[];
  mode: GateMode[];
  since: number[];
};

const DT = 1 / 60;

export class Flow {
  ps: Particle[] = [];
  arc: number[] = [];
  gates: Gate[];
  events: ReleaseEvent[] = [];
  private spawnT = 0;
  private arcT = 0;
  private len: number;

  constructor(
    private geo: FlowGeometry,
    readonly tune: Tuning,
  ) {
    this.len = geo.nodes[geo.nodes.length - 1] ?? 0;
    this.gates = geo.gateStages.map((stage) => ({
      stage,
      stop: (geo.nodes[stage] ?? 0) - geo.gateGap,
      mode: "idle" as GateMode,
      t: 0,
      progress: 0,
      queue: 0,
      released: 0,
      batch: 0,
      since: 99,
      openAmt: 0,
    }));
    // seed evenly spaced work along the whole rail
    const gap = tune.speed * tune.interval;
    for (let p = this.len - gap * 0.5; p >= 0; p -= gap) {
      let passed = 0;
      this.gates.forEach((g, k) => {
        if (p > g.stop) passed |= 1 << k;
      });
      this.ps.push({ pos: p, v: tune.speed, boost: 0, passed, queued: false });
    }
    for (let u = 0.1; u < 1; u += tune.arcInterval / tune.arcDuration) this.arc.push(u);
    // deterministic starting released counts so the stats are not all zero
    this.gates.forEach((g, k) => (g.released = 38 - k * 3));
  }

  get length() {
    return this.len;
  }
  get nodes() {
    return this.geo.nodes;
  }

  /** Rescale to new geometry (resize), keeping relative positions. */
  setGeometry(geo: FlowGeometry) {
    const nl = geo.nodes[geo.nodes.length - 1] ?? 0;
    const k = this.len > 0 ? nl / this.len : 1;
    this.geo = geo;
    this.len = nl;
    this.ps.forEach((p) => (p.pos *= k));
    this.gates.forEach((g) => (g.stop = (geo.nodes[g.stage] ?? 0) - geo.gateGap));
    this.ps.forEach((p) =>
      this.gates.forEach((g, i) => {
        if (p.pos > g.stop + 0.5) p.passed |= 1 << i;
        else p.passed &= ~(1 << i);
      }),
    );
  }

  /** Advance by dt seconds using fixed substeps (frame-rate independent and deterministic). */
  advance(dt: number) {
    let left = Math.min(dt, 0.1);
    while (left > 1e-6) {
      const h = Math.min(DT, left);
      this.step(h);
      left -= h;
    }
  }

  warm(seconds: number) {
    const n = Math.round(seconds / DT);
    for (let i = 0; i < n; i++) this.step(DT);
    this.events.length = 0;
  }

  private step(dt: number) {
    const { speed, spacing, open, interval } = this.tune;

    // gates: idle -> review (when work is waiting) -> open -> idle
    this.gates.forEach((g, k) => {
      g.since += dt;
      g.t += dt;
      const bit = 1 << k;
      const prev = this.geo.nodes[g.stage - 1] ?? -Infinity;
      if (g.mode === "idle") {
        g.progress = 0;
        if (this.ps.some((p) => !(p.passed & bit) && p.pos > prev && g.stop - p.pos < spacing * 0.6)) {
          g.mode = "review";
          g.t = 0;
        }
      } else if (g.mode === "review") {
        const dur = this.tune.review[k] ?? 4;
        g.progress = Math.min(1, g.t / dur);
        if (g.t >= dur) {
          g.mode = "open";
          g.t = 0;
          g.since = 0;
          let n = 0;
          for (const p of this.ps) {
            if (!(p.passed & bit) && p.pos > prev && g.stop - p.pos < 400) {
              if (p.queued) n++;
              p.boost = 1;
            }
          }
          g.batch = n;
          g.released += n;
          this.events.push({ gate: k, n });
        }
      } else {
        g.progress = 1;
        if (g.t >= open) {
          g.mode = "idle";
          g.t = 0;
          g.progress = 0;
        }
      }
      const target = g.mode === "open" ? 1 : 0;
      g.openAmt += (target - g.openAmt) * Math.min(1, dt * 10);
    });

    // particles, leader first (array is kept sorted by pos descending)
    for (let i = 0; i < this.ps.length; i++) {
      const p = this.ps[i]!;
      let limit = Infinity;
      if (i > 0) limit = this.ps[i - 1]!.pos - spacing;
      this.gates.forEach((g, k) => {
        if (!(p.passed & (1 << k)) && g.mode !== "open") limit = Math.min(limit, g.stop);
      });
      let want = speed * (1 + 1.1 * p.boost);
      if (limit < Infinity) want = Math.min(want, Math.max(0, limit - p.pos) * 4.5);
      p.v += (want - p.v) * Math.min(1, dt * 7);
      if (p.v < 0) p.v = 0;
      p.pos = Math.min(p.pos + p.v * dt, Math.max(p.pos, limit));
      p.boost = Math.max(0, p.boost - dt * 0.55);
      p.queued = p.v < speed * 0.3 && limit < Infinity && limit - p.pos < 2;
      this.gates.forEach((g, k) => {
        if (p.pos > g.stop + 0.5) p.passed |= 1 << k;
      });
    }
    // exit at Monitoring; refine items leave Monitoring on their own cadence
    while (this.ps.length && this.ps[0]!.pos >= this.len) this.ps.shift();

    this.spawnT += dt;
    const last = this.ps[this.ps.length - 1];
    if (this.spawnT >= interval && (!last || last.pos > spacing)) {
      this.spawnT = 0;
      this.ps.push({ pos: 0, v: speed, boost: 0, passed: 0, queued: false });
    }

    const du = dt / this.tune.arcDuration;
    for (let i = 0; i < this.arc.length; i++) this.arc[i]! += du;
    while (this.arc.length && this.arc[0]! >= 1) this.arc.shift();
    this.arcT += dt;
    if (this.arcT >= this.tune.arcInterval) {
      this.arcT = 0;
      this.arc.push(0);
    }

    this.gates.forEach((g, k) => {
      const bit = 1 << k;
      g.queue = this.ps.filter((p) => p.queued && !(p.passed & bit) && p.pos > (this.geo.nodes[g.stage - 1] ?? -1)).length;
    });
  }

  snapshot(): Snapshot {
    const n = this.geo.nodes;
    const inFlight = n.map((x, i) => {
      const lo = i === 0 ? -1 : ((n[i - 1] ?? 0) + x) / 2;
      const hi = i === n.length - 1 ? Infinity : (x + (n[i + 1] ?? 0)) / 2;
      return this.ps.filter((p) => p.pos >= lo && p.pos < hi).length;
    });
    inFlight[n.length - 1] = (inFlight[n.length - 1] ?? 0) + this.arc.filter((u) => u < 0.5).length;
    return {
      inFlight,
      queue: this.gates.map((g) => g.queue),
      progress: this.gates.map((g) => Math.round(g.progress * 100) / 100),
      released: this.gates.map((g) => g.released),
      mode: this.gates.map((g) => g.mode),
      since: this.gates.map((g) => Math.round(g.since * 100) / 100),
    };
  }
}

export const TUNING: Tuning = {
  speed: 58,
  interval: 1.3,
  spacing: 15,
  review: [3.8, 3.0],
  open: 1.0,
  arcDuration: 7,
  arcInterval: 2.3,
};

/** Seconds of simulated history before the first frame, chosen so a gate is mid-review with a neat queue. */
export const WARM = 14;

/** Static snapshot for the first (server + client) render, from a fixed reference geometry. */
export function referenceSnapshot(gateStages: readonly number[]): Snapshot {
  const col = 200;
  const nodes = [0, 1, 2, 3, 4, 5].map((i) => i * col);
  const f = new Flow({ nodes, gateStages, gateGap: 50 }, { ...TUNING, speed: TUNING.speed });
  f.warm(WARM);
  return f.snapshot();
}
