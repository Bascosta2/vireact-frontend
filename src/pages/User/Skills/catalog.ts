import type { ShowcaseId } from '@/remotion/skills/remotion-reel/Showcase';
import { STYLE_COVERS, type StyleCategory } from '@/remotion/styles/covers';
import { PAINTED_STYLE_IDS, STYLE_IDS, type StyleId } from '@/remotion/styles/ids';
import { LIBRARY, type LibraryLayout } from '@/remotion/styles/library';

/**
 * The Skills library: each editing skill (ported from a Claude skill, see editor-skills/ in the parent
 * project) with what it does and a showcase clip. `id` matches the backend registry
 * (vireact-backend/src/service/editor/skills.js). Two kinds:
 *   - editing skills (Remotion Reel): a way of editing, with its own caption and hook components;
 *   - animation styles: the whole edit drawn in one look, from the "10 Claude Animation Styles" guide;
 *   - painted styles: real painting media (watercolour, ink, oil, gouache, paper) drawn in code, from the
 *     painting prompts in editor-skills/done/painted-styles in the parent project.
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
  /** What it is for (talking head, any footage, animated storytelling, explainers...); the library groups by it. */
  category: StyleCategory;
  /** Other library sections it also shows in. */
  tags: StyleCategory[];
  /** How the picture is laid out (library styles): restyled footage, a window, a scene, or a scene with you in a bubble. */
  layout: LibraryLayout;
  /** The kind of video its cover shows ("Gameplay", "Story: the koi pond"). */
  shown: string;
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
  category: 'talking-head',
  tags: [],
  layout: 'footage',
  shown: 'Talking head: reel',
  bestFor: 'Talking-head reels for Instagram and TikTok',
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
  notYet: [
    'Screen recordings with camera moves',
    'Background removal (graphics behind you, the silhouette layout)',
    'Split screen from a full-frame take',
    'Your own brand sheet (colors, fonts)',
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

const HAND_COPY: Partial<Record<StyleId, StyleCopy>> = {
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
  watercolour: {
    name: 'Watercolour',
    tagline: 'Painted in water and light: soft washes, blooms and dried edges over your footage, like a picture book come to life.',
    bestFor: 'Calm explainers, wellness, food, travel and gentle storytelling',
    look: 'Soft watercolour washes with blooms and dried edges, pigment settling into cold-press paper.',
    ambient: 'A koi pond: fish gliding under drifting lily pads, ripples spreading as the sun glints.',
    captions: 'Soft ink lettering on a painted cream card, 3 words a line.',
    hook: 'A short painted title, like the first line of a storybook: "Slow mornings, better days".',
    graphics: 'Headlines and lists with room to breathe; few graphics, painted in washes.',
    transition: 'Cards bloom like fresh paint and fade like washes in water.',
    sound: 'Shimmers and soft ticks inside the footage.',
  },
  'roman-mosaic': {
    name: 'Roman Mosaic',
    tagline: 'Your video in thousands of tiny stone tiles: grout lines, gold flecks and a sea turtle gliding overhead.',
    bestFor: 'History, travel, food and craft content',
    look: 'Small stone tiles laid in rows that follow every outline, each with its own colour shift.',
    ambient: 'A sea turtle drawn in tiles gliding over a mosaic sand floor as light shimmers across it.',
    captions: 'Carved serif lettering on a white mosaic panel, 3 words a line.',
    hook: 'Like an inscription carved for a floor: "Strength, built daily".',
    graphics: 'Inscriptions, tallies and coin numbers; rows of tiles for lists.',
    transition: 'Stone columns lean like ruins as the frame passes into open sea.',
    sound: 'Stone taps and clicks.',
  },
  'sumi-e': {
    name: 'Sumi-e',
    tagline: 'One brush and deep quiet: black ink, mist and empty paper, with a single red sun.',
    bestFor: 'Mindfulness, craft, philosophy and slow premium brands',
    look: 'Ink wash from deep black to pale grey, wet edges, dry brush strokes, lots of empty paper.',
    ambient: 'Two painted cranes standing in a misty valley beneath the red sun, the only colour.',
    captions: 'Spare ink lettering, one word brushed in red. Lines fade like settling ink.',
    hook: 'One brush-written line between hairlines: "Less, but deeper".',
    graphics: 'Very few: one every 12 to 15 seconds, and no slams. Space does the work.',
    transition: 'A sweeping brush veil of ink crosses the frame.',
    sound: 'Near silence: no hook sound, rare soft brush strokes.',
  },
  'impasto-oil': {
    name: 'Impasto Oil',
    tagline: 'Thick paint and big seas: knife strokes you can almost touch, waves rolling like paint.',
    bestFor: 'Dramatic storytelling, sea and nature, bold opinion pieces',
    look: 'Thick oil paint with palette-knife strokes that follow every form, canvas weave showing through.',
    ambient: 'Painted whales breaching through a roiling painted sea beside a small rocking boat.',
    captions: 'Chunky cream lettering on deep teal paint, 3 words a line.',
    hook: 'A bold painted statement: "The sea does not care".',
    graphics: 'Counters in a painted ring; slams land in a splash of strokes with a shake.',
    transition: 'A sheet of dragged paint wipes the frame clean.',
    sound: 'Deep sweeps and heavy booms.',
  },
  'nocturne-gouache': {
    name: 'Nocturne Gouache',
    tagline: 'A meadow after dark: matte night paint, moonlit edges and rising fireflies.',
    bestFor: 'Night routines, sleep, calm and evening storytelling',
    look: 'Dark opaque gouache in blues and greens, moonlight as a pale edge on everything.',
    ambient: 'A deer stepping into a night meadow as fireflies rise, drift and blink.',
    captions: 'Chalk-warm lettering touched with firelight, gentle fades.',
    hook: 'A quiet night line: "What the dark teaches you".',
    graphics: 'Numbers gathered from fireflies; lists like stars coming out.',
    transition: 'A moon-pale shape drifts across and veils the frame.',
    sound: 'Soft sparkles and shimmers.',
  },
  'botanical-plate': {
    name: 'Botanical Plate',
    tagline: 'Like a plate from an old field guide: fine ink, soft washes and a butterfly crossing the frame.',
    bestFor: 'Education, nature, gardening, wellness and careful explainers',
    look: 'Fine ink outlines with soft watercolour fills on cream paper, airy and readable.',
    ambient: 'A blue butterfly fluttering to a daisy while stems bend gently from their bases.',
    captions: 'Refined serif lettering on the cream plate, 3 words a line.',
    hook: 'A plate title in fine ink: "Field notes: morning light".',
    graphics: 'Specimen lists, underline flourishes and label pins that point.',
    transition: 'A cream blank falls away like turning a herbarium page.',
    sound: 'Page turns and fine taps.',
  },
  'paper-cut': {
    name: 'Paper Cut',
    tagline: 'An ocean made of layered paper: soft shadows, knife-cut edges and a glowing jellyfish.',
    bestFor: 'Playful explainers, family content and layered stories',
    look: 'Layers of cut paper from pale surface blue to near black, each shadowing the next.',
    ambient: 'A glowing tissue-paper jellyfish pulsing up through paper seas as fish part around it.',
    captions: 'Round lettering on a pink paper card with a soft paper shadow.',
    hook: 'Short and bright, on a pink paper card: "Deep breath, dive in".',
    graphics: 'Paper scraps peeling in; list items pinned like a school board.',
    transition: 'A pale paper wave climbs and veils the frame.',
    sound: 'Paper pops, snaps and soft pats.',
  },
  'art-nouveau': {
    name: 'Art Nouveau',
    tagline: 'A poster come to life: whiplash vines, a turning halo and a hummingbird in gold and sage.',
    bestFor: 'Beauty, fashion, food, drink and elegant brands',
    look: 'Flowing curved lines, dark outlines and flat muted fills on aged lithograph paper.',
    ambient: 'A hummingbird hovering and darting between trumpet flowers inside a slow-turning halo.',
    captions: 'Elegant gold capitals around the framed scene.',
    hook: 'A poster title in flowing letters: "The art of the morning".',
    graphics: 'Vine underlines, leaf markers and a halo behind the big numbers.',
    transition: 'Curtains of printed leaves sweep across the frame.',
    sound: 'Gentle chimes and soft page sounds.',
  },
  'golden-hour': {
    name: 'Golden Hour',
    tagline: 'The last hour of light: warm paint, long shadows and a swallow over wheat.',
    bestFor: 'Travel, outdoors, food, gratitude and reflective posts',
    look: 'Warm opaque gouache in gold, amber and rose with a soft hazy sky.',
    ambient: 'A swallow swooping and banking over a wheat field bending in waves.',
    captions: 'Warm serif lettering across the sunlit middle band.',
    hook: 'A warm reflective line: "The last hour of light".',
    graphics: 'Numbers cresting like the sun; dashes that wave like wheat.',
    transition: 'A sheet of full-sun orange climbs to a soft lens flare.',
    sound: 'Warm sweeps and soft chimes.',
  },
  'painted-anime': {
    name: 'Painted Anime',
    tagline: 'A meadow you run through: painted skies, big clouds and two kids running on a summer day.',
    bestFor: 'Wholesome stories, childhood and summer topics, gentle vlogs',
    look: 'Hand-painted gouache backgrounds, lush greens and big white cumulus clouds.',
    ambient: 'Two kids running through a summer meadow, drawn on twos, grass and hair in the wind.',
    captions: 'Soft round lettering on a white card with a gentle bounce.',
    hook: 'Bright and simple, like the first line of a summer story: "That summer, we ran".',
    graphics: 'Clouds, sun and paper planes drifting across like a title sequence.',
    transition: 'A giant painted cloud drifts across and veils the frame.',
    sound: 'Pops, bubbles and cheerful dings.',
  },
};

/** Every style's copy: the hand-written sets above, then the library's (library.json). */
const STYLE_COPY = {
  ...HAND_COPY,
  ...Object.fromEntries(
    Object.values(LIBRARY).map((e) => [e.id, { name: e.name, tagline: e.tagline, bestFor: e.bestFor, look: e.look.charAt(0).toUpperCase() + e.look.slice(1) + '.', ambient: e.ambient, captions: e.captions, hook: e.hook, graphics: e.graphics, transition: e.transition, sound: e.sound }]),
  ),
} as Record<StyleId, StyleCopy>;

const styleSkill = (id: StyleId): EditingSkill => {
  const s = STYLE_COPY[id];
  const cover = STYLE_COVERS[id];
  const lib = LIBRARY[id];
  const layout: LibraryLayout = lib?.layout ?? (cover.category === 'storytelling' ? 'story' : 'footage');
  const story = layout === 'story';
  const explainer = layout === 'explainer';
  const feature = (key: string, title: string, what: string): SkillFeature => ({ id: key, title, what, showcase: null, status: 'live' });
  return {
    id,
    kind: 'animation',
    category: cover.category,
    tags: lib?.tags ?? [],
    layout,
    shown: cover.shown,
    name: s.name,
    tagline: s.tagline,
    origin: lib
      ? `From ${lib.source}`
      : (PAINTED_STYLE_IDS as readonly string[]).includes(id)
        ? 'Painted style from the "10 Claude Animation Styles" prompts'
        : 'Animation style from "10 Claude Animation Styles"',
    bestFor: s.bestFor,
    hero: { kind: 'style', id },
    how: explainer
      ? [
          'Record yourself explaining: you stay on screen in a bubble in the corner.',
          'Cuts your take like every skill does: dead air, filler and repeated takes out, the best moment up front.',
          `Draws the idea around you as an animated ${s.name} scene, with your lists, numbers and charts in its style.`,
          'Lets you switch to another style, or show your full footage instead of the scene, on the review page.',
        ]
      : story
      ? [
          'Record yourself telling the story: any video works, only your voice is used.',
          'Cuts the narration like every skill does: dead air, filler and repeated takes out, so the story flows.',
          `Paints the whole frame as an animated ${s.name} world, with the story told in its captions, title and transitions.`,
          'Lets you switch to another style, or show your own footage instead of the painting, on the review page.',
        ]
      : [
          'Cuts your take the same way every skill does: dead air, filler and repeated takes out, the best moment up front.',
          layout === 'window'
            ? `Places your footage inside the ${s.name} world and draws captions, hook, graphics and transitions in its style.`
            : cover.category === 'talking-head'
              ? `Redraws everything around you in the ${s.name} style: captions, hook, graphics, transitions and the frame.`
              : `Redraws your footage in the ${s.name} style, whatever it shows: gameplay, a product, b-roll or a screen recording.`,
          `Plans the edit for the style: ${s.bestFor.toLowerCase()} suit it best, and graphics and sounds follow its rules.`,
          'Lets you switch to any other animation style on the review page, with no new edit needed.',
        ],
    features: [
      feature('look', story ? 'The animated world' : explainer ? 'The scene around you' : 'Footage look', story ? `The whole frame is drawn: ${s.look.charAt(0).toLowerCase()}${s.look.slice(1)}` : s.look),
      feature('ambient', 'Ambient animation', s.ambient),
      feature('captions', 'Captions', s.captions),
      feature('hook', 'Text hook', s.hook),
      feature('graphics', 'Graphics', s.graphics),
      feature('transition', 'Transitions', s.transition),
    ],
    rules: [
      story
        ? { title: 'Your voice, an animated world', what: 'The picture is drawn in code from the style, nothing is AI-generated, and the voice is yours. You can show your own footage instead.' }
        : explainer
          ? { title: 'You, explaining', what: 'You stay on screen in a bubble while the scene is drawn in code around you. Nothing is AI-generated, and you can show your full footage instead.' }
          : { title: 'Your footage only', what: 'The style is drawn on top of your own video. Nothing is generated or swapped out.' },
      { title: 'Sound to match', what: `${s.sound} Music stays under your voice.` },
      { title: 'Same restraint', what: 'Graphics only where they add something, never more than one every few seconds.' },
      { title: 'One look, start to finish', what: 'Every element shares the style’s colors, type and motion, so the edit looks designed.' },
    ],
  };
};

export const ANIMATION_STYLES: EditingSkill[] = STYLE_IDS.map(styleSkill);

export const SKILLS: EditingSkill[] = [REMOTION_REEL, ...ANIMATION_STYLES];

export const skillById = (id: string | null | undefined) => SKILLS.find((s) => s.id === id) ?? null;
