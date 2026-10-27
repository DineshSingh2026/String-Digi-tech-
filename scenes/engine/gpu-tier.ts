import type { Tier } from "./types";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Resolve a render tier: 0 = poster only, 1 = reduced GL (no post), 2+ = full. Falls back to 1. */
export async function detectTier(timeoutMs = 3500): Promise<Tier> {
  if (typeof window === "undefined") return 1;
  if (!hasWebGL()) return 0;
  const timeout = new Promise<Tier>((resolve) => window.setTimeout(() => resolve(1), timeoutMs));
  const detect = (async (): Promise<Tier> => {
    try {
      const { getGPUTier } = await import("detect-gpu");
      const r = await getGPUTier();
      if (r.type === "WEBGL_UNSUPPORTED" || r.type === "BLOCKLISTED") return 0;
      const t = Math.max(0, Math.min(3, Math.round(r.tier)));
      if (t === 0) return r.type === "FALLBACK" ? 1 : 0;
      if (r.isMobile && t > 2) return 2;
      return t as Tier;
    } catch {
      return 1;
    }
  })();
  return Promise.race([detect, timeout]);
}
