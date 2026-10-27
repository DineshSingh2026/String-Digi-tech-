export const CONFIG = {
  seed: 7,
  /** particles in the ambient stream behind the DOM track panel */
  count: 520,
  /** horizontal speed range, NDC units per second */
  speed: [0.05, 0.16],
  /** half-thickness of the stream around the panel centre, NDC */
  spread: 0.32,
  colors: {
    muted: "#8A97A6",
    signal: "#33D1B4",
    caution: "#F5A524",
    accent: "#F44E04",
  },
  signalShare: 0.22,
} as const;
