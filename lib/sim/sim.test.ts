import { describe, it, expect } from "vitest";
import { rng, priceGen, DEFAULT_SCHEDULE, exposureGen, clusterGen, infraGen, tickerGen } from "./index";

describe("sim generators", () => {
  it("rng is deterministic", () => {
    const a = rng(7);
    const b = rng(7);
    for (let i = 0; i < 10; i++) expect(a()).toBe(b());
    expect(rng(1)()).not.toBe(rng(2)());
  });

  it("priceGen is deterministic and positive", () => {
    const a = priceGen(42, DEFAULT_SCHEDULE);
    expect(a).toEqual(priceGen(42, DEFAULT_SCHEDULE));
    expect(a.length).toBe(DEFAULT_SCHEDULE.reduce((s, x) => s + x.steps, 0) + 1);
    expect(a.every((p) => p.price > 0)).toBe(true);
    expect(priceGen(43, DEFAULT_SCHEDULE)).not.toEqual(a);
  });

  it("exposure drawdown never exceeds limit", () => {
    for (let seed = 1; seed < 60; seed++) {
      const p = priceGen(seed, [
        { regime: "highVol", steps: 400 },
        { regime: "thinLiquidity", steps: 300 },
      ]);
      const e = exposureGen(p, 0.08);
      let eq = 1;
      let peak = 1;
      for (let i = 1; i < p.length; i++) {
        eq *= 1 + e[i].exposure * (p[i].price / p[i - 1].price - 1);
        peak = Math.max(peak, eq);
        expect(1 - eq / peak).toBeLessThanOrEqual(0.08 + 1e-9);
        expect(e[i].exposure).toBeGreaterThanOrEqual(0);
        expect(e[i].exposure).toBeLessThanOrEqual(1);
        expect(e[i].drawdown).toBeLessThanOrEqual(e[i].limit);
      }
    }
    expect(exposureGen(priceGen(3, DEFAULT_SCHEDULE), 0.1)).toEqual(exposureGen(priceGen(3, DEFAULT_SCHEDULE), 0.1));
  });

  it("clusterGen is deterministic and bounded", () => {
    const a = clusterGen(5, 4, 500);
    expect(a).toEqual(clusterGen(5, 4, 500));
    expect(a.every((p) => Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && Math.abs(p.tx) <= 1 && Math.abs(p.ty) <= 1)).toBe(true);
    const noise = a.filter((p) => p.cluster === -1).length / a.length;
    expect(noise).toBeGreaterThan(0.07);
    expect(noise).toBeLessThan(0.25);
  });

  it("infraGen is deterministic and cycles anomalies", () => {
    const a = infraGen(9);
    const b = infraGen(9);
    expect(a.nodes).toEqual(b.nodes);
    const seen = new Set<string>();
    let anomalies = 0;
    for (let i = 0; i < 200; i++) {
      const x = a.step(100);
      expect(x).toEqual(b.step(100));
      if (x.anomalyId !== null) anomalies++;
      x.nodes.forEach((n) => seen.add(n.status));
    }
    expect(anomalies).toBeGreaterThanOrEqual(3);
    expect(seen.has("isolated")).toBe(true);
  });

  it("tickerGen is deterministic", () => {
    const a = tickerGen(11);
    const b = tickerGen(11);
    expect(a.initial).toEqual(b.initial);
    for (let i = 0; i < 5; i++) expect(a.next()).toEqual(b.next());
  });
});
