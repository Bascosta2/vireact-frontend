import { loadFont as loadBangers } from '@remotion/google-fonts/Bangers';
import { loadFont as loadComicNeue } from '@remotion/google-fonts/ComicNeue';
import { loadFont as loadPressStart } from '@remotion/google-fonts/PressStart2P';
import { loadFont as loadSilkscreen } from '@remotion/google-fonts/Silkscreen';
import { loadFont as loadCaveatBrush } from '@remotion/google-fonts/CaveatBrush';
import { loadFont as loadPatrickHand } from '@remotion/google-fonts/PatrickHand';
import { loadFont as loadTitanOne } from '@remotion/google-fonts/TitanOne';
import { loadFont as loadFredoka } from '@remotion/google-fonts/Fredoka';
import { loadFont as loadRussoOne } from '@remotion/google-fonts/RussoOne';
import { loadFont as loadChakraPetch } from '@remotion/google-fonts/ChakraPetch';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';
import { loadFont as loadBaloo } from '@remotion/google-fonts/Baloo2';
import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';
import { loadFont as loadKalam } from '@remotion/google-fonts/Kalam';
import { loadFont as loadCinzel } from '@remotion/google-fonts/Cinzel';
import { loadFont as loadMarcellus } from '@remotion/google-fonts/Marcellus';
import { loadFont as loadYujiBoku } from '@remotion/google-fonts/YujiBoku';
import { loadFont as loadShipporiMincho } from '@remotion/google-fonts/ShipporiMincho';
import { loadFont as loadAbrilFatface } from '@remotion/google-fonts/AbrilFatface';
import { loadFont as loadLora } from '@remotion/google-fonts/Lora';
import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces';
import { loadFont as loadLibreBaskerville } from '@remotion/google-fonts/LibreBaskerville';
import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadSniglet } from '@remotion/google-fonts/Sniglet';
import { loadFont as loadFedero } from '@remotion/google-fonts/Federo';
import { loadFont as loadDMSerif } from '@remotion/google-fonts/DMSerifDisplay';
import { loadFont as loadMPlusRounded } from '@remotion/google-fonts/MPLUSRounded1c';
import { loadFont as loadZenMaru } from '@remotion/google-fonts/ZenMaruGothic';
import { continueRender, delayRender } from 'remotion';
import { FONT_MODULES } from './font-modules';
import type { StyleId } from './ids';
import { LIBRARY } from './library';

/**
 * Each style's two fonts. They load the first time the style is drawn (not when the app starts), so an
 * edit only fetches its own fonts. The render waits for them (loadFont holds the frame until they arrive)
 * and loading twice is a no-op, so this is safe to call while rendering.
 */
export interface StyleFonts {
  display: string;
  body: string;
}

const opts = <const T extends readonly string[]>(weights: T) => ({ weights: [...weights] as T[number][], subsets: ['latin'] as 'latin'[] });
const stack = (family: string, fallback: string) => `"${family}", ${fallback}`;
const SANS = '"Helvetica Neue", Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

const LOADERS: Partial<Record<StyleId, () => StyleFonts>> = {
  'glow-sketch': () => {
    const f = loadOutfit('normal', opts(['300', '600', '800']));
    return { display: stack(f.fontFamily, SANS), body: stack(f.fontFamily, SANS) };
  },
  'comic-art': () => ({
    display: stack(loadBangers('normal', opts(['400'])).fontFamily, 'Impact, sans-serif'),
    body: stack(loadComicNeue('normal', opts(['700'])).fontFamily, SANS),
  }),
  'brick-build': () => ({
    display: stack(loadTitanOne('normal', opts(['400'])).fontFamily, SANS),
    body: stack(loadFredoka('normal', opts(['600'])).fontFamily, SANS),
  }),
  'pixel-art': () => ({
    display: stack(loadPressStart('normal', opts(['400'])).fontFamily, 'monospace'),
    body: stack(loadSilkscreen('normal', opts(['400', '700'])).fontFamily, 'monospace'),
  }),
  chalkboard: () => ({
    display: stack(loadCaveatBrush('normal', opts(['400'])).fontFamily, 'cursive'),
    body: stack(loadPatrickHand('normal', opts(['400'])).fontFamily, 'cursive'),
  }),
  'retro-3d': () => ({
    display: stack(loadRussoOne('normal', opts(['400'])).fontFamily, SANS),
    body: stack(loadChakraPetch('normal', opts(['600', '700'])).fontFamily, SANS),
  }),
  'flat-vector': () => {
    const f = loadPoppins('normal', opts(['600', '800']));
    return { display: stack(f.fontFamily, SANS), body: stack(f.fontFamily, SANS) };
  },
  'minimal-line': () => {
    const f = loadManrope('normal', opts(['200', '300', '500']));
    return { display: stack(f.fontFamily, SANS), body: stack(f.fontFamily, SANS) };
  },
  'cgi-motion': () => {
    const f = loadSpaceGrotesk('normal', opts(['500', '700']));
    return { display: stack(f.fontFamily, SANS), body: stack(f.fontFamily, SANS) };
  },
  'explainer-3d': () => ({
    display: stack(loadBaloo('normal', opts(['800'])).fontFamily, SANS),
    body: stack(loadNunito('normal', opts(['800'])).fontFamily, SANS),
  }),
  watercolour: () => {
    const f = loadKalam('normal', opts(['400', '700']));
    return { display: stack(f.fontFamily, 'cursive'), body: stack(f.fontFamily, 'cursive') };
  },
  'roman-mosaic': () => ({
    display: stack(loadCinzel('normal', opts(['700', '900'])).fontFamily, SERIF),
    body: stack(loadMarcellus('normal', opts(['400'])).fontFamily, SERIF),
  }),
  'sumi-e': () => ({
    display: stack(loadYujiBoku('normal', opts(['400'])).fontFamily, SERIF),
    body: stack(loadShipporiMincho('normal', opts(['600'])).fontFamily, SERIF),
  }),
  'impasto-oil': () => ({
    display: stack(loadAbrilFatface('normal', opts(['400'])).fontFamily, SERIF),
    body: stack(loadLora('normal', opts(['600'])).fontFamily, SERIF),
  }),
  'nocturne-gouache': () => ({
    display: stack(loadFraunces('normal', opts(['700', '800'])).fontFamily, SERIF),
    body: stack(loadLora('normal', opts(['500'])).fontFamily, SERIF),
  }),
  'botanical-plate': () => {
    const f = loadLibreBaskerville('normal', opts(['700']));
    loadLibreBaskerville('italic', opts(['400']));
    loadCormorant('italic', opts(['600']));
    return { display: stack(f.fontFamily, SERIF), body: stack('Cormorant Garamond', SERIF) };
  },
  'paper-cut': () => {
    const f = loadSniglet('normal', opts(['400', '800']));
    return { display: stack(f.fontFamily, SANS), body: stack(f.fontFamily, SANS) };
  },
  'art-nouveau': () => ({
    display: stack(loadFedero('normal', opts(['400'])).fontFamily, SERIF),
    body: stack(loadCormorant('normal', opts(['600'])).fontFamily, SERIF),
  }),
  'golden-hour': () => ({
    display: stack(loadDMSerif('normal', opts(['400'])).fontFamily, SERIF),
    body: stack(loadLora('normal', opts(['600'])).fontFamily, SERIF),
  }),
  'painted-anime': () => ({
    display: stack(loadMPlusRounded('normal', opts(['800', '900'])).fontFamily, SANS),
    body: stack(loadZenMaru('normal', opts(['700'])).fontFamily, SANS),
  }),
};

type FontModule = { loadFont: (style: string, opts: { weights: string[]; subsets: string[] }) => { waitUntilDone: () => Promise<unknown> } };
const requested = new Set<string>();

/**
 * Loads a library font in the background (it is code-split, so styles only fetch their own). The render
 * holds the frame until it arrives; the CSS already names the family, so text switches to it on load.
 */
function loadLibraryFont(mod: string, weights: string) {
  const key = `${mod}:${weights}`;
  const entry = FONT_MODULES[mod];
  if (requested.has(key) || !entry) return;
  requested.add(key);
  const handle = delayRender(`Loading font ${mod}`);
  entry
    .load()
    .then((m) => (m as FontModule).loadFont('normal', { weights: weights.split(','), subsets: ['latin'] }).waitUntilDone())
    .catch(() => undefined)
    .finally(() => continueRender(handle));
}

/** A library style's fonts (library.json). */
function libraryFonts(id: StyleId): StyleFonts | null {
  const e = LIBRARY[id];
  if (!e) return null;
  const [[d, dw], [b, bw]] = e.fonts;
  loadLibraryFont(d, dw);
  loadLibraryFont(b, bw);
  return { display: stack(FONT_MODULES[d]?.family ?? d, SANS), body: stack(FONT_MODULES[b]?.family ?? b, SANS) };
}

const loaded = new Map<StyleId, StyleFonts>();

export function styleFonts(id: StyleId): StyleFonts {
  const hit = loaded.get(id);
  if (hit) return hit;
  let fonts: StyleFonts;
  try {
    fonts = LOADERS[id]?.() ?? libraryFonts(id) ?? { display: SANS, body: SANS };
  } catch {
    // Outside a browser (tests) or a font error: fall back to system fonts rather than fail the edit.
    fonts = { display: SANS, body: SANS };
  }
  loaded.set(id, fonts);
  return fonts;
}
