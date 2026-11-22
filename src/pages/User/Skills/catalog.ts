import type { ShowcaseId } from '@/remotion/skills/remotion-reel/Showcase';

/**
 * The Skills library: each editing skill (ported from a Claude skill, see editor-skills/ in the parent
 * project) with what it does and a showcase clip per feature. `id` matches the backend registry
 * (vireact-backend/src/service/editor/skills.js).
 */

export type FeatureStatus = 'live' | 'coming';

export interface SkillFeature {
  id: string;
  title: string;
  what: string;
  showcase: ShowcaseId | null;
  status: FeatureStatus;
}

export interface EditingSkill {
  id: 'remotion-reel';
  name: string;
  tagline: string;
  /** Where the skill came from. */
  origin: string;
  hero: ShowcaseId;
  /** What it does, step by step, in plain words. */
  how: string[];
  features: SkillFeature[];
  /** Rules the AI editor follows with this skill (no visual of their own). */
  rules: { title: string; what: string }[];
}

export const SKILLS: EditingSkill[] = [
  {
    id: 'remotion-reel',
    name: 'Remotion Reel',
    tagline: 'A talking-head reel edited the way a pro edits in code: an Instagram-style text hook, clean outlined captions, and every beat landed on the word you say it.',
    origin: 'Claude skill "remotion-reel"',
    hero: 'reel',
    how: [
      'Measures your take first: your words, your cuts and pauses, before anything is placed.',
      'Writes a short text hook in your own words and pins it above your head from the first frame.',
      'Captions you 1 to 3 words at a time, lowercase, and clears each line the moment you stop saying it.',
      'Adds graphics only where they add something (about 3 to 6 in a 50-second video), each starting on its word.',
      'Keeps music well under your voice and only a few sound effects, and keeps everything inside the Instagram crop.',
    ],
    features: [
      {
        id: 'hook',
        title: 'Instagram-style text hook',
        what: 'Your hook as a native text sticker above your head, still from the first frame. One outline wraps every line so corners flare instead of pinching. Three styles: white, black, plain.',
        showcase: 'hook',
        status: 'live',
      },
      {
        id: 'captions',
        title: 'Outlined TikTok captions',
        what: '1 to 3 words, casual lowercase, white with a black outline painted behind the letters. No pop or bounce: a line appears with its words and is gone when you stop, never lingering into a pause.',
        showcase: 'captions',
        status: 'live',
      },
      {
        id: 'panel',
        title: 'Two-thirds panel layout',
        what: 'For screen recordings and graphics: the graphic fills the top of the frame and you sit in a rounded panel below, your whole head inside. Coming next: needs screen-recording uploads.',
        showcase: 'panel',
        status: 'coming',
      },
    ],
    rules: [
      { title: 'Measured, not guessed', what: 'Every cut, graphic and sound sits on a word you say or a real cut in your footage.' },
      { title: 'Story first', what: 'Graphics go on the hook, the turns and the payoff, each with a job: prove a claim, explain an idea, or emphasize a line. No stamp text.' },
      { title: 'Sound under the voice', what: 'Music sits well below your voice; a short list of pops and whooshes, never two within a second.' },
      { title: 'Inside the crop', what: 'Anything that matters stays inside the area Instagram shows in the 4:5 grid.' },
    ],
  },
];

/** Parts of the original skill not in this version yet, so expectations stay honest. */
export const NOT_YET = [
  'Screen recordings with camera moves',
  'Background removal (graphics behind you, the silhouette layout)',
  'Split screen from a full-frame take',
  'Your own brand sheet (colors, fonts)',
  'Beat-by-beat storyboard review',
];

export const skillById = (id: string | null | undefined) => SKILLS.find((s) => s.id === id) ?? null;
