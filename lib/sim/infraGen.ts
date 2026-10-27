import { rng } from "./rng";

export type NodeStatus = "ok" | "warn" | "anomaly" | "isolated";
export type InfraNode = { id: number; cpu: number; mem: number; latencyMs: number; status: NodeStatus };

const ANOMALY_MS = 900;
const ISOLATED_MS = 1600;

/** Toy infra telemetry. An anomaly fires every 4-6 s: ok -> anomaly -> isolated -> ok. */
export function infraGen(
  seed: number,
  count = 24,
): {
  nodes: InfraNode[];
  step: (dtMs: number) => { nodes: InfraNode[]; anomalyId: number | null };
} {
  const r = rng(seed);
  let nodes: InfraNode[] = Array.from({ length: count }, (_, id) => ({
    id,
    cpu: 0.2 + r() * 0.4,
    mem: 0.3 + r() * 0.4,
    latencyMs: 2 + r() * 4,
    status: "ok" as NodeStatus,
  }));
  let untilNext = 4000 + r() * 2000;
  let active: { id: number; age: number } | null = null;
  const drift = (v: number, lo: number, hi: number, s: number) => Math.max(lo, Math.min(hi, v + (r() - 0.5) * s));

  const step = (dtMs: number) => {
    untilNext -= dtMs;
    let anomalyId: number | null = null;
    if (active) {
      active.age += dtMs;
      if (active.age > ANOMALY_MS + ISOLATED_MS) active = null;
    }
    if (untilNext <= 0) {
      untilNext = 4000 + r() * 2000;
      active = { id: Math.floor(r() * count), age: 0 };
      anomalyId = active.id;
    }
    const a = active;
    nodes = nodes.map((n) => {
      let status: NodeStatus = "ok";
      let cpu = drift(n.cpu, 0.1, 0.75, 0.04);
      let latencyMs = drift(n.latencyMs, 1, 8, 0.6);
      if (a && a.id === n.id) {
        if (a.age < ANOMALY_MS) {
          status = "anomaly";
          cpu = 0.92 + r() * 0.07;
          latencyMs = 40 + r() * 30;
        } else {
          status = "isolated";
          cpu = 0.05;
          latencyMs = 0;
        }
      } else if (cpu > 0.7) status = "warn";
      return { id: n.id, cpu, mem: drift(n.mem, 0.2, 0.85, 0.02), latencyMs, status };
    });
    return { nodes, anomalyId };
  };
  return { nodes, step };
}
