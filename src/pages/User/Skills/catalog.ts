import type { ShowcaseId } from '@/remotion/skills/remotion-reel/Showcase';
import { editorFeaturesV2 } from '@/api/editor';
import { STYLE_IDS, type StyleId } from '@/remotion/styles/ids';

/**
 * The Skills library: each editing skill (ported from a Claude skill, see editor-skills/ in the parent
 * project) with what it does and a showcase clip. `id` matches the backend registry
 * (vireact-backend/src/service/editor/skills.js). Two kinds:
 *   - editing skills (Remotion Reel): a way of editing, with its own caption and hook components;
 *   - animation styles: the whole edit drawn in one look, from the "10 Claude Animation Styles" guide.
 */

export type FeatureStatus = 'live' | 'coming';

/** A showcase clip: a Remotion Reel feature, or an animation style. */
export type Showcase = { kind: 'reel'; id: ShowcaseId } | { kind: 'style'; id: StyleId };

export interface SkillFeature {
  id: string;
  title: string;
  what: string;
  showcase: Showcase | null;
  status: FeatureStatus;
}

export type SkillId = 'remotion-reel' | StyleId;

export interface EditingSkill {
  id: SkillId;
  kind: 'editing' | 'animation';
  name: string;
  tagline: string;
  /** Where the skill came from. */
  origin: string;
  /** What it suits, in a few words (animation styles). */
  bestFor?: string;
  hero: Showcase;
  /** What it does, step by step, in plain words. */
  how: string[];
  features: SkillFeature[];
  /** Rules the AI editor follows with this skill (no visual of their own). */
  rules: { title: string; what: string }[];
  /** Parts of the original skill not in this version yet, so expectations stay honest. */
  notYet?: string[];
}

const REMOTION_REEL: EditingSkill = {
  id: 'remotion-reel',
  kind: 'editing',
  name: 'Remotion Reel',
  tagline: 'A talking-head reel edited the way a pro edits in code: an Instagram-style text hook, clean outlined captions, and every beat landed on the word you say it.',
  origin: 'Claude skill "remotion-reel"',
  hero: { kind: 'reel', id: 'reel' },
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
      showcase: { kind: 'reel', id: 'hook' },
      status: 'live',
    },
    {
      id: 'captions',
      title: 'Outlined TikTok captions',
      what: '1 to 3 words, casual lowercase, white with a black outline painted behind the letters. No pop or bounce: a line appears with its words and is gone when you stop, never lingering into a pause.',
      showcase: { kind: 'reel', id: 'captions' },
      status: 'live',
    },
    {
      id: 'panel',
      title: 'Two-thirds panel layout',
      what: 'For screen recordings and graphics: the graphic fills the top of the frame and you sit in a rounded panel below, your whole head inside. Coming next: needs screen-recording uploads.',
      showcase: { kind: 'reel', id: 'panel' },
      status: 'coming',
    },
  ],
  rules: [
    { title: 'Measured, not guessed', what: 'Every cut, graphic and sound sits on a word you say or a real cut in your footage.' },
    { title: 'Story first', what: 'Graphics go on the hook, the turns and the payoff, each with a job: prove a claim, explain an idea, or emphasize a line. No stamp text.' },
    { title: 'Sound under the voice', what: 'Music sits well below your voice; a short list of pops and whooshes, never two within a second.' },
    { title: 'Inside the crop', what: 'Anything that matters stays inside the area Instagram shows in the 4:5 grid.' },
  ],
  // Each item that shipped behind VITE_EDITOR_FEATURES_V2 drops off this list once the flag is on.
  notYet: [
    'Screen recordings with camera moves',
    'Background removal (graphics behind you, the silhouette layout)',
    ...(editorFeaturesV2() ? [] : ['Split screen from a full-frame take']),
    ...(editorFeaturesV2() ? [] : ['Your own brand sheet (colors, fonts)']),
    'Beat-by-beat storyboard review',
  ],
};

/** What each animation style changes, in the order the library lists them. */
interface StyleCopy {
  name: string;
  tagline: string;
  bestFor: string;
  look: string;
  ambient: string;
  captions: string;
  hook: string;
  graphics: string;
  transition: string;
  sound: string;
}

const STYLE_COPY: Record<StyleId, StyleCopy> = {
  'glow-sketch': {
    name: 'Glow Sketch',
    tagline: 'Your video at night: thin neon outlines, a warm golden streetlight glow and a city skyline traced in light.',
    bestFor: 'Futuristic explainers, high-contrast motion graphics, night scenes',
    look: 'Your footage goes dark and moody, with a cool night tint and a warm streetlight cone from the top of the frame.',
    ambient: 'A glowing skyline outline along the bottom with windows that pulse, a neon frame, and a streetlight that flickers now and then.',
    captions: 'Warm glowing letters; emphasis words glow red. Each line catches like a neon tube: on, off, on.',
    hook: 'A neon sign above your head that flickers on.',
    graphics: 'Cards outlined in neon, outlined glowing numbers, neon brackets around slams.',
    transition: 'A neon line scans down the frame over a dimmed picture.',
    sound: 'Shimmers and soft sweeps.',
  },
  'comic-art': {
    name: 'Comic Art',
    tagline: 'Your video as a comic page: bold outlines, halftone dots, flat bright color and a narrator’s caption box.',
    bestFor: 'Story-led content, playful explainers, pop visuals',
    look: 'Punchy, saturated color with halftone print dots, inside a white gutter and a heavy black panel border.',
    ambient: 'The page itself: halftone texture and the panel frame stay on the whole time.',
    captions: 'Comic lettering in capitals with a thick black outline and a hard drop shadow; emphasis words in yellow. Lines pop in.',
    hook: 'A yellow narrator’s caption box, tilted like a comic panel ("Meanwhile...").',
    graphics: 'White panels with black borders and hard shadows; slams land on a red starburst like a sound effect.',
    transition: 'A white comic panel swipes across on a slant, trailing speed lines.',
    sound: 'Pops, snaps and booms.',
  },
  'brick-build': {
    name: 'Brick Build',
    tagline: 'Your video built from toy bricks: bright plastic colors, studded plates and snappy stop-motion moves.',
    bestFor: 'Family-friendly content, product demos, playful brand visuals',
    look: 'Bright, glossy, toy-like color with a plastic sheen.',
    ambient: 'A band of studded bricks along the top and bottom; a brick hops now and then.',
    captions: 'Chunky rounded letters with a solid shadow, popping in on two-frame steps like stop-motion.',
    hook: 'A yellow brick plate with studs on top.',
    graphics: 'Blue brick plates for cards, bricks as list bullets, slams on a red plate, a ring of studs for callouts.',
    transition: 'A wall of bricks drops in row by row to cover the cut, then pops away.',
    sound: 'Clicks and snaps, like bricks locking together.',
  },
  'pixel-art': {
    name: 'Pixel Art',
    tagline: 'Your video as a retro game: pixel type, a score and hearts HUD, an XP bar, and motion in crisp little steps.',
    bestFor: 'Gaming content, retro campaigns, app intros',
    look: 'Saturated color with scanlines and a fine pixel grid.',
    ambient: 'A HUD with a running score and three hearts, pixel clouds looping across the top, and your progress as an XP bar.',
    captions: 'Pixel type with a hard outline, 2 words at a time (pixel letters are wide). No fades: lines just appear.',
    hook: 'An RPG dialog box that types itself out, with a blinking arrow.',
    graphics: 'Dialog-box cards, scores that count up, quest-log lists with arrow bullets, a blinking target for callouts.',
    transition: 'A pixel dissolve: big squares fill the frame in a scattered order, then clear.',
    sound: 'Blips, coins and power-ups.',
  },
  chalkboard: {
    name: 'Chalkboard',
    tagline: 'Your video on a classroom board: chalk handwriting, hand-drawn doodles and lines that draw themselves.',
    bestFor: 'Education, tutorials, simplified explainers',
    look: 'Softer, warmer color with a chalkboard-green tint and chalk dust.',
    ambient: 'A wooden board frame with a chalk tray, and chalk doodles in the corners that draw themselves in.',
    captions: 'Chalk handwriting on a strip of board, revealed left to right as if written.',
    hook: 'The lesson title written on a small board, underlined in yellow chalk.',
    graphics: 'Board cards, check marks that draw themselves, a scribbled chalk ring for slams and callouts.',
    transition: 'An eraser swipe across the board.',
    sound: 'Taps and page turns.',
  },
  'retro-3d': {
    name: 'Retro 3D',
    tagline: 'Your video as an early-2000s 3D console game: beveled HUD panels, metal lettering and a turning low-poly crystal.',
    bestFor: 'Nostalgic gaming edits, retro loops, stylized ads',
    look: 'Crisp color with blue distance fog and a soft scanline dither.',
    ambient: 'A low-poly crystal turning in the corner, and your progress as a segmented HUD bar.',
    captions: 'Chunky game lettering with a hard shadow and a blue glow; emphasis in mint green. Lines swing in like a menu.',
    hook: 'A beveled briefing panel with a MISSION tab that swings down on a hinge.',
    graphics: 'Beveled metal panels, chrome numbers, a lock-on reticle for callouts.',
    transition: 'The game camera swings round to the next shot.',
    sound: 'Blips and power-ups.',
  },
  'flat-vector': {
    name: 'Flat Vector',
    tagline: 'Your video as a clean editorial illustration: flat shapes, balanced color and tidy, presentation-style motion.',
    bestFor: 'Presentations, startups, explainer videos',
    look: 'Clean, slightly brighter color.',
    ambient: 'Flat shapes in the corners (a circle, a rounded square, dots) that slide in and drift on parallax layers.',
    captions: 'Bold sans on a white pill with a flat teal shadow; emphasis in coral. Lines slide in.',
    hook: 'A white card with a flat coral shadow and a small badge.',
    graphics: 'White cards with flat offset shadows, round colored bullets, numbers with a flat shadow. No slams.',
    transition: 'Three flat color panels sweep across.',
    sound: 'Pops and soft swooshes.',
  },
  'minimal-line': {
    name: 'Minimal Line',
    tagline: 'Your video with very thin lines, lots of space and one red accent: quiet, premium and calm.',
    bestFor: 'Premium UI motion, brand systems, modern abstract explainers',
    look: 'Near black-and-white with a soft vignette.',
    ambient: 'Thin corner brackets and a ruled baseline that draw themselves in, and a slow red record light.',
    captions: 'Light lowercase type with a red emphasis word. Lines fade in.',
    hook: 'One line of light type between two hairlines that draw out from the centre.',
    graphics: 'Thin outlined frames, very light numbers, a ring that draws itself. Fewer graphics than other styles, and no slams.',
    transition: 'A hairline crosses the frame while the picture dips almost to black.',
    sound: 'A few soft ticks, played quieter.',
  },
  'cgi-motion': {
    name: 'CGI Motion',
    tagline: 'Your video with a polished CGI finish: cinematic light, glass and chrome, and a camera that never stops drifting.',
    bestFor: 'Premium product ads, premium reels, cinematic content',
    look: 'A teal-and-orange cinematic grade with a heavy vignette.',
    ambient: 'A slow camera drift the whole time, out-of-focus lights rising through the frame, and an anamorphic flare streak.',
    captions: 'Clean bold type with a soft glow; emphasis in warm orange.',
    hook: 'A frosted glass card with chrome lettering and a highlight that sweeps across it.',
    graphics: 'Glass cards, chrome numbers that glow, slams that land on a lens flare.',
    transition: 'A band of light sweeps across as the shot changes.',
    sound: 'Whooshes, shimmers and deep impacts.',
  },
  'explainer-3d': {
    name: 'Explainer 3D',
    tagline: 'Your video in friendly, rounded 3D: puffy cards, clay-like lettering and soft, bouncy motion in bright daylight.',
    bestFor: 'SaaS explainers, education, approachable brands',
    look: 'Bright daylight color with a soft glow at the edges.',
    ambient: 'Puffy clouds drifting at the top and glossy spheres bobbing at the bottom.',
    captions: 'Rounded clay lettering with a soft 3D edge; emphasis in yellow. Lines bounce in softly.',
    hook: 'A puffy rounded card with a glossy ball on its corner.',
    graphics: 'Puffy cards, glossy ball bullets, chunky 3D numbers, a soft sphere behind slams.',
    transition: 'A soft bubble grows from the middle and opens onto the next shot.',
    sound: 'Pops, bubbles and chimes.',
  },
};

const styleSkill = (id: StyleId): EditingSkill => {
  const s = STYLE_COPY[id];
  const feature = (key: string, title: string, what: string): SkillFeature => ({ id: key, title, what, showcase: null, status: 'live' });
  return {
    id,
    kind: 'animation',
    name: s.name,
    tagline: s.tagline,
    origin: 'Animation style from "10 Claude Animation Styles"',
    bestFor: s.bestFor,
    hero: { kind: 'style', id },
    how: [
      'Cuts your take the same way every skill does: dead air, filler and repeated takes out, the best moment up front.',
      `Redraws everything on top in the ${s.name} style: captions, hook, graphics, transitions and the frame around you.`,
      `Plans the edit for the style: ${s.bestFor.toLowerCase()} suit it best, and graphics and sounds follow its rules.`,
      'Lets you switch to any other animation style on the review page, with no new edit needed.',
    ],
    features: [
      feature('look', 'Footage look', s.look),
      feature('ambient', 'Ambient animation', s.ambient),
      feature('captions', 'Captions', s.captions),
      feature('hook', 'Text hook', s.hook),
      feature('graphics', 'Graphics', s.graphics),
      feature('transition', 'Transitions', s.transition),
    ],
    rules: [
      { title: 'Your footage only', what: 'The style is drawn on top of your own video. Nothing is generated or swapped out.' },
      { title: 'Sound to match', what: `${s.sound} Music stays under your voice.` },
      { title: 'Same restraint', what: 'Graphics only where they add something, never more than one every few seconds.' },
      { title: 'One look, start to finish', what: 'Every element shares the style’s colors, type and motion, so the edit looks designed.' },
    ],
  };
};

export const ANIMATION_STYLES: EditingSkill[] = STYLE_IDS.map(styleSkill);

export const SKILLS: EditingSkill[] = [REMOTION_REEL, ...ANIMATION_STYLES];

export const skillById = (id: string | null | undefined) => SKILLS.find((s) => s.id === id) ?? null;
