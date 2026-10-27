export const CONFIG = {
  seed: 20240611,
  /** Number of simulated price paths (rows in the data texture). */
  paths: 192,
  /** Samples per path (columns in the data texture). */
  samples: 512,
  /** Instanced comet trails. One draw call regardless of count. */
  particles: { tier1: 12000, tier2: 24000 },
  /** Particles reserved for the single accent path. */
  highlightParticles: 260,
  /** Segments per trail ribbon (curved trails follow the path). */
  segments: 12,
  /** Box-filter radius (samples) applied to each path before upload. */
  smoothRadius: 4,
  speed: 0.03,
  calmFactor: 0.45,
  /** Trail ribbon width in CSS px (scaled by depth). */
  width: 1.6,
  /** Mean trail length as a fraction of the plot width. */
  trail: 0.07,
  /** Fraction of paths kept inside the envelope (sets the band width empirically). */
  breachQuantile: 0.78,
} as const;
