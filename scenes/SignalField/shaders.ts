/**
 * Trail ribbons: each instance is a short curved comet that follows one simulated price path.
 * Per-vertex: aU (0 = tail, 1 = head), aSide (-1 / +1 across the ribbon).
 * Per-instance: aPath (row), aPhase, aJit, aDepth.
 */
export const trailVert = /* glsl */ `
uniform sampler2D uPaths;

uniform float uTime;
uniform float uSpeed;
uniform float uYScale;
uniform float uDpr;
uniform float uWidth;
uniform float uTrail;
uniform float uHighlight;
uniform float uOpacity;
uniform float uVol;
uniform vec4 uRect;
uniform vec2 uRes;
uniform vec2 uMouse;


attribute float aPath;
attribute float aPhase;
attribute float aJit;
attribute float aDepth;
varying float vU;
varying float vSide;
varying float vAlpha;
varying float vBreach;
varying float vFlash;
varying float vHi;
varying float vDepth;
varying float vHot;

vec3 samplePath(float s) {
  float fx = clamp(s, 0.0, 1.0) * (TEX_W - 1.0);
  float i0 = floor(fx);
  float f = fx - i0;
  float v = (aPath + 0.5) / TEX_H;
  vec4 a = texture2D(uPaths, vec2((i0 + 0.5) / TEX_W, v));
  vec4 b = texture2D(uPaths, vec2((min(i0 + 1.0, TEX_W - 1.0) + 0.5) / TEX_W, v));
  float y = mix(a.r, b.r, f);
  return vec3(mix(uRect.x, uRect.y, s), uRect.z + y * uYScale, a.b);
}

// Cursor adds local volatility: jagged high-frequency noise + an expanding ripple.
float hot(vec2 p) {
  vec2 d = (p - uMouse) * vec2(uRes.x / uRes.y, 1.0);
  return exp(-dot(d, d) * 9.0);
}
vec2 volatility(vec2 p, float s) {
  vec2 d = (p - uMouse) * vec2(uRes.x / uRes.y, 1.0);
  float r = length(d);
  float infl = exp(-r * r * 9.0);
  float jag = sin(s * 260.0 + aPath * 1.7 - uTime * 7.0) * 0.6 + sin(s * 610.0 + aPath * 3.1 + uTime * 11.0) * 0.4;
  float ring = sin(r * 38.0 - uTime * 5.0) * exp(-r * 4.0);
  p.y += uVol * (infl * 0.045 * jag + ring * 0.008);
  return p;
}

void main() {
  float aU = position.x;
  float aSide = position.y;
  float hi = 1.0 - step(0.5, abs(aPath - uHighlight));
  float spd = uSpeed * (0.75 + 0.5 * fract(aJit * 3.71)) * mix(1.0, 0.8, hi);
  float head = fract(aPhase + uTime * spd);
  float L = uTrail * mix(0.35, 1.6, fract(aJit * 13.7)) * mix(1.0, 2.2, hi);
  float s = head - L * (1.0 - aU);
  float ds = 0.004;

  vec3 a = samplePath(s);
  vec3 b = samplePath(s - ds);
  float breach = a.z;
  vec2 p = volatility(a.xy, s);
  vec2 q = volatility(b.xy, s - ds);

  vec2 dir = (p - q) * uRes;
  float dl = length(dir);
  dir = dl > 1e-5 ? dir / dl : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);

  float depth = aDepth;
  float wPx = uWidth * uDpr * mix(0.7, 2.2, depth) * mix(1.0, 2.0, hi) * (0.35 + 0.65 * aU);
  // +1.5px feather for anti-aliasing
  p += nrm * aSide * (wPx * 0.5 + 1.5 * uDpr) * 2.0 / uRes;

  vU = aU;
  vSide = aSide * (wPx * 0.5 + 1.5 * uDpr) / max(wPx * 0.5, 0.5);
  vHi = hi;
  vDepth = depth;
  vHot = hot(a.xy) * uVol;
  float past = s - breach;
  vBreach = smoothstep(0.0, 0.012, past);
  float pf = past / 0.014;
  vFlash = breach < 1.5 ? exp(-pf * pf) : 0.0;
  float clip = 1.0 - smoothstep(0.03, 0.13, past);
  float edge = smoothstep(0.0, 0.035, s) * (1.0 - smoothstep(0.93, 1.0, s)) * step(0.0, s);
  vAlpha = edge * clip * uOpacity;


  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const trailFrag = /* glsl */ `
uniform vec3 uColNear;
uniform vec3 uColFar;
uniform vec3 uColGrey;
uniform vec3 uColRisk;
uniform vec3 uColHi;
uniform vec3 uColHot;
varying float vU;
varying float vSide;
varying float vAlpha;
varying float vBreach;
varying float vFlash;
varying float vHi;
varying float vDepth;
varying float vHot;

void main() {
  float across = clamp(1.0 - abs(vSide), 0.0, 1.0);
  across = across * across * (3.0 - 2.0 * across);
  float u = clamp(vU, 0.0, 1.0);
  float along = u * u * sqrt(u);
  float headGlow = smoothstep(0.88, 1.0, u);

  vec3 col = mix(uColFar, uColNear, vDepth);
  col = mix(col, uColHot, clamp(vHot, 0.0, 1.0) * 0.7);
  col = mix(col, uColGrey, vBreach);
  col = mix(col, uColRisk, vFlash);
  col = mix(col, uColHi, vHi);

  float base = mix(0.05, 0.42, vDepth * vDepth);
  base = mix(base, base * 0.55, vBreach);
  base = max(base, vFlash * 0.9);
  base = mix(base, 0.32, vHi);
  float a = vAlpha * across * (along * base + headGlow * base * 0.9);
  a *= 1.0 + vHot * 0.8;
  gl_FragColor = vec4(clamp(col, 0.0, 4.0), clamp(a, 0.0, 1.0));
  #include <colorspace_fragment>
}
`;

export const bandVert = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** Luminous drawdown envelope: soft tube fill brighter toward the limits, glowing edge, faint time grid. */
export const bandFrag = /* glsl */ `
uniform vec4 uRect;
uniform float uEnvC;
uniform float uYScale;
uniform float uOpacity;
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uColEdge;
uniform vec3 uColFill;
uniform vec3 uColOrigin;
varying vec2 vNdc;

void main() {
  float s = (vNdc.x - uRect.x) / (uRect.y - uRect.x);
  vec2 pxPerNdc = uRes * 0.5;
  // origin glow ("now" point) may extend left of the plot
  vec2 od = (vNdc - vec2(uRect.x, uRect.z)) * pxPerNdc;
  float origin = exp(-length(od) / 26.0) * 0.9 + exp(-length(od) / 120.0) * 0.18;

  float sc = clamp(s, 0.0, 1.0);
  float hw = uEnvC * (sqrt(sc) + 0.05) * uYScale;
  float dy = abs(vNdc.y - uRect.z);
  float dPx = (dy - hw) * pxPerNdc.y;
  float inPlot = step(0.0, s) * step(s, 1.0);
  float fade = smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.86, 1.0, s));

  float inside = 1.0 - smoothstep(-1.0, 1.0, dPx);
  float rel = clamp(dy / max(hw, 1e-4), 0.0, 1.0);
  float rel2 = rel * rel;
  float fill = inside * (0.035 + 0.11 * rel2 * rel2);
  float core = exp(-dPx * dPx / 1.4);
  float halo = exp(-abs(dPx) / 16.0) * 0.32 + exp(-abs(dPx) / 60.0) * 0.08;
  // faint vertical time grid + dashed centre line inside the band
  float xPx = vNdc.x * pxPerNdc.x;
  float grid = inside * (1.0 - smoothstep(0.0, 1.0, abs(fract(s * 12.0 + 0.5) - 0.5) * (uRect.y - uRect.x) * pxPerNdc.x / 12.0)) * 0.05;
  float centre = (1.0 - smoothstep(0.0, 1.0, abs(vNdc.y - uRect.z) * pxPerNdc.y)) * step(0.5, fract(xPx / 10.0)) * 0.12;
  // slow sheen travelling along the edges
  float sheen = 0.75 + 0.25 * sin(s * 9.0 - uTime * 0.8);

  float bandA = (fill + grid + centre) * fade * inPlot;
  float edgeA = (core * 0.85 + halo) * fade * inPlot * sheen;
  vec3 col = uColFill * bandA + uColEdge * edgeA + uColOrigin * origin;
  float a = (bandA + edgeA + origin) * uOpacity;
  float tot = bandA + edgeA + origin;
  gl_FragColor = vec4(col / max(tot, 1e-4), clamp(a, 0.0, 1.0));
  #include <colorspace_fragment>
}
`;
