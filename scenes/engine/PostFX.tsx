"use client";

import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { Tier } from "./types";

/** Post stack: restrained bloom (only the accent highlight crosses threshold), film grain, vignette. */
export default function PostFX({ tier }: { tier: Tier }) {
  if (tier < 2) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.2} intensity={0.7} mipmapBlur />
      <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.25} darkness={0.6} />
    </EffectComposer>
  );
}
