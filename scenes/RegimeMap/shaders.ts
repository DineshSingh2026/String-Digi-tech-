/** Full-screen ambient pass: a regime-coloured halo hugging the DOM chart panel. Never draws chart marks itself. */
export const ambientVert = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const ambientFrag = /* glsl */ `
uniform float uOpacity;
uniform float uTime;
uniform float uAspect;
uniform vec3 uColor;
uniform vec2 uCenter;
uniform vec2 uHalf;
varying vec2 vNdc;

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = vec2((vNdc.x - uCenter.x) * uAspect, vNdc.y - uCenter.y);
  vec2 hb = vec2(uHalf.x * uAspect, uHalf.y);
  float d = sdBox(p, hb, 0.06);
  float halo = exp(-max(d, 0.0) * 6.0);
  float inner = 1.0 - smoothstep(-0.25, 0.0, d);
  // slow drifting bands, like regime strata
  float band = 0.5 + 0.5 * sin(vNdc.y * 9.0 + uTime * 0.35 + sin(vNdc.x * 2.0 + uTime * 0.2) * 1.5);
  // fine dot grid that brightens near the panel
  vec2 g = fract(gl_FragCoord.xy / 28.0) - 0.5;
  float dots = (1.0 - smoothstep(0.035, 0.07, length(g))) * halo * 0.35;
  float a = halo * (0.15 + 0.09 * band) + inner * 0.06 + dots;
  gl_FragColor = vec4(uColor * a * uOpacity, 1.0);
  #include <colorspace_fragment>
}
`;
