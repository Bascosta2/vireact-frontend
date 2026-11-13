import { Composition, type CalculateMetadataFunction } from 'remotion';
import { EditComposition } from './EditComposition';
import type { EditProps } from './types';

/** Must match COMPOSITION_ID in the backend (service/editor/render.service.js). */
export const COMPOSITION_ID = 'VireactEdit';

const sampleProps: EditProps = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 90,
  timeline: [],
  captions: null,
  hook: { text: 'Preview', startFrame: 0, durationFrames: 60 },
  zooms: [],
  graphics: [],
  transitions: [],
  effects: [],
  look: { grade: 'vivid', accent: '#FFD43B', progressBar: true, motion: true },
  sfx: [],
  music: null,
  framing: { mode: 'fill', focusX: 0.5 },
  videoUrl: '',
  musicUrl: null,
  sfxUrls: {},
};

const calculateMetadata: CalculateMetadataFunction<EditProps> = ({ props }) => ({
  durationInFrames: Math.max(1, props.durationInFrames),
  fps: props.fps,
  width: props.width,
  height: props.height,
});

/** Entry for the Remotion Lambda site (deployed from remotion-deploy/). */
export function RemotionRoot() {
  return (
    <Composition
      id={COMPOSITION_ID}
      component={EditComposition}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={90}
      defaultProps={sampleProps}
      calculateMetadata={calculateMetadata}
    />
  );
}
