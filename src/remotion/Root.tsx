import { AbsoluteFill, Composition, OffthreadVideo, useCurrentFrame, type CalculateMetadataFunction } from 'remotion';
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

/** Id of the test composition for the Lambda chunk-boundary check of the alpha matte. */
export const MATTE_TEST_ID = 'MatteFlickerTest';

/**
 * Plays only the matte (a WebM with alpha) over a loud backdrop with a frame counter, for 600 frames,
 * so a render split at framesPerLambda 120 crosses 4 chunk boundaries (frames 120, 240, 360, 480).
 * Flicker, a dropped outline or a black frame at those frames means WebM alpha is not safe on Lambda.
 * Not used by the app. Render steps: see the PR that added it (npx remotion lambda render ... MatteFlickerTest).
 */
export function MatteFlickerTest({ matteUrl }: { matteUrl: string }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `hsl(${(frame * 3) % 360} 80% 45%)` }}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontSize: 320, fontWeight: 900, color: '#fff', fontFamily: 'sans-serif' }}>
        {frame}
      </AbsoluteFill>
      {matteUrl ? <OffthreadVideo src={matteUrl} transparent muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
    </AbsoluteFill>
  );
}

/** Entry for the Remotion Lambda site (deployed from remotion-deploy/). */
export function RemotionRoot() {
  return (
    <>
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
      <Composition id={MATTE_TEST_ID} component={MatteFlickerTest} width={1080} height={1920} fps={30} durationInFrames={600} defaultProps={{ matteUrl: '' }} />
    </>
  );
}
