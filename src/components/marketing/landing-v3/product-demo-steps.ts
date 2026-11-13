/**
 * Copy, clips and timing for the hero product demo (ProductDemo.tsx).
 *
 * Steps 1–3 assess the first 8 seconds of a client vlog (@Ils): "I'm 18 and feel so so stupid bro, cause people
 * my age living in penthouses, there's people my age going to university…", cut every 1–2 s, one-word coloured
 * captions that sit mid-frame (over his face on the Tube shots). Steps 4–5 edit a client talking-head (@cedlom):
 * "Okay, this is my A-roll. Basically, it's where I record myself talking to the camera… I posted it on my story,
 * a lot of you had questions…". Clips are used with the clients' permission; scores are illustrative.
 */

export const CLIPS = {
  vlog: { src: '/demo/ils-hook.mp4', poster: '/demo/ils-hook.jpg' },
  talking: { src: '/demo/cedlom-hook.mp4', poster: '/demo/cedlom-hook.jpg' },
} as const;
export type ClipId = keyof typeof CLIPS;

/** Assessment of the vlog (steps 1–3). */
export const VLOG = {
  file: 'feeling-behind-at-18.mp4',
  length: '0:26',
  size: '22 MB',
  score: 76,
  verdict: 'Strong hook and pacing. The captions are holding it back.',
  meters: [
    { label: 'Hook', value: 84 },
    { label: 'Pacing', value: 88 },
    { label: 'Audio', value: 71 },
    { label: 'Caption', value: 52 },
  ],
  hookNote: { at: '0:00–0:01', text: 'Great first line, but the opening shot is wide and dark. Open close on your face.' },
  hookRewrite: '18 and already behind?',
  captionNote: { at: '0:05–0:07', text: 'Captions cover your face on the Tube shots. Move them lower.' },
};

/** Edit of the talking-head (steps 4–5). */
export const TALKING = {
  hookOverlay: 'YOU ASKED ABOUT MY SETUP',
  changes: [
    'Cut "Okay," and the pauses',
    'Opened on "you had questions"',
    'Highlighted key words',
    '2 punch-in zooms',
    'Music under the voice',
  ],
  before: '0:58',
  after: '0:51',
  scoreBefore: 58,
  scoreAfter: 81,
};

export type DemoStepId = 'upload' | 'score' | 'feedback' | 'edit' | 'export';

export interface DemoStep {
  id: DemoStepId;
  title: string;
  /** Tab label under the demo. */
  short: string;
  /** What the scene shows, for screen readers (the animation itself is hidden from them). */
  sr: string;
  /** How long the step plays before the demo moves on. */
  ms: number;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'upload',
    title: 'Upload your video',
    short: 'Upload',
    sr: `A creator uploads a ${VLOG.length} vlog, ${VLOG.file}. Vireact starts analysing its hook, pacing, audio and captions.`,
    ms: 3400,
  },
  {
    id: 'score',
    title: 'Get your score',
    short: 'Score',
    sr: `The vlog gets a virality score of ${VLOG.score}: ${VLOG.meters.map((m) => `${m.label.toLowerCase()} ${m.value}`).join(', ')}. ${VLOG.verdict}`,
    ms: 4000,
  },
  {
    id: 'feedback',
    title: 'See what to fix',
    short: 'Fix',
    sr: `Feedback. Hook, ${VLOG.hookNote.at}: ${VLOG.hookNote.text} Suggested on-screen hook: "${VLOG.hookRewrite}" Captions, ${VLOG.captionNote.at}: ${VLOG.captionNote.text}`,
    ms: 4800,
  },
  {
    id: 'edit',
    title: 'Let AI edit it',
    short: 'AI edit',
    sr: `A talking-head video about a camera setup gets an AI edit: ${TALKING.changes.join(', ').toLowerCase()}. It goes from ${TALKING.before} to ${TALKING.after}.`,
    ms: 5600,
  },
  {
    id: 'export',
    title: 'Export and post',
    short: 'Export',
    sr: `The edited video is ready to download as an MP4 and is scored again: ${TALKING.scoreBefore} before, ${TALKING.scoreAfter} after.`,
    ms: 4000,
  },
];
