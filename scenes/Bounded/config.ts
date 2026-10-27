export const CONFIG = {
  /** Half distance between the two limit lines, in NDC (fallback layout only). */
  limit: 0.26,
  /** Inside a data-scene-rect: limit lines sit at this fraction of the rect's half-height. */
  rectLimit: 0.78,
  /** Max line excursion as a fraction of the limit (always < 1: the line never touches the limits). */
  excursion: 0.6,
  /** Where along the plot the live head sits (0..1). */
  head: 0.8,
  speed: 0.3,
  calmFactor: 0.4,
} as const;
