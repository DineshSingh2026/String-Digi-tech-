import { rng, gaussian } from "./rng";

export type ClusterPoint = { x: number; y: number; cluster: number; tx: number; ty: number };

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** Points start as uniform noise (x,y) and target gaussian blobs (tx,ty). cluster -1 stays noise. */
export function clusterGen(seed: number, k: number, n = 600): ClusterPoint[] {
  const r = rng(seed);
  const centers: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i < k; i++) {
    const a = (i / Math.max(1, k)) * Math.PI * 2 + r() * 0.6;
    const rad = 0.35 + r() * 0.3;
    centers.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, s: 0.06 + r() * 0.07 });
  }
  const pts: ClusterPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = r() * 2 - 1;
    const y = r() * 2 - 1;
    if (k <= 0 || r() < 0.15) {
      pts.push({ x, y, cluster: -1, tx: x, ty: y });
    } else {
      const c = Math.floor(r() * k);
      const ctr = centers[c];
      pts.push({ x, y, cluster: c, tx: clamp(ctr.x + gaussian(r) * ctr.s), ty: clamp(ctr.y + gaussian(r) * ctr.s) });
    }
  }
  return pts;
}
