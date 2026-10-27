/** DOM pipeline panel -> ambient WebGL scene. Written by components/pipeline/PipelineDiagram each frame; read in useFrame. */
export const pipelineBus = {
  /** panel centre y and half-height in NDC; hh=0 means unknown */
  cy: 0,
  hh: 0,
  /** monotonically increasing count of review releases, used to flash the backdrop */
  releases: 0,
};
