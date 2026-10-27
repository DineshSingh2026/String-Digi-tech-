/**
 * Tiny mutable channel from the DOM RegimeMap chart to the ambient WebGL scene.
 * Written by RegimeChart every frame; read in the scene's useFrame. No React re-renders.
 */
export const regimeBus = {
  /** playhead 0..1 along the series */
  playhead: 0,
  /** regime index 0..3 (trend, meanRevert, highVol, thinLiquidity) */
  regime: 0,
  /** chart panel centre and half-size in NDC (y up); w=0 means unknown */
  cx: 0.35,
  cy: 0,
  hw: 0,
  hh: 0,
};

export const REGIME_ORDER = ["trend", "meanRevert", "highVol", "thinLiquidity"] as const;
