"use client";

import { Canvas } from "@react-three/fiber";
import { useSceneStore } from "./scene-store";
import SceneRegistry from "./SceneRegistry";
import PostFX from "./PostFX";

/** The single persistent WebGL canvas. Loaded lazily (ssr:false) by SceneCanvas. */
export default function GLStage() {
  const hidden = useSceneStore((s) => s.hidden);
  const tier = useSceneStore((s) => s.tier);
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={hidden ? "never" : "always"}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 100 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <color attach="background" args={["#06080B"]} />
      <SceneRegistry />
      <PostFX tier={tier} />
    </Canvas>
  );
}
