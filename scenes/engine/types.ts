export type Tier = 0 | 1 | 2 | 3;
export type SceneProps = { opacity: number; progress: number; tier: Tier; calm?: boolean };
export type SceneName =
  | "SignalField"
  | "SignalFieldCalm"
  | "RegimeMap"
  | "Pipeline"
  | "NoiseToSignal"
  | "NodeMesh"
  | "Assembly"
  | "Bounded"
  | "ServiceTiles";
export const SCENE_NAMES: readonly SceneName[] = [
  "SignalField", "SignalFieldCalm", "RegimeMap", "Pipeline", "NoiseToSignal", "NodeMesh", "Assembly", "Bounded", "ServiceTiles",
];
export function isSceneName(v: string | null | undefined): v is SceneName {
  return !!v && (SCENE_NAMES as readonly string[]).includes(v);
}
