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
import type { StyleId } from './ids';

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

const LOADERS: Record<StyleId, () => StyleFonts> = {
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
};

const loaded = new Map<StyleId, StyleFonts>();

export function styleFonts(id: StyleId): StyleFonts {
  const hit = loaded.get(id);
  if (hit) return hit;
  let fonts: StyleFonts;
  try {
    fonts = LOADERS[id]();
  } catch {
    // Outside a browser (tests) or a font error: fall back to system fonts rather than fail the edit.
    fonts = { display: SANS, body: SANS };
  }
  loaded.set(id, fonts);
  return fonts;
}
