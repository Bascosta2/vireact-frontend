import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadArchivoBlack } from '@remotion/google-fonts/ArchivoBlack';
import { loadFont as loadBangers } from '@remotion/google-fonts/Bangers';
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadDmSans } from '@remotion/google-fonts/DMSans';
import { loadFont as loadFredoka } from '@remotion/google-fonts/Fredoka';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadLora } from '@remotion/google-fonts/Lora';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadOswald } from '@remotion/google-fonts/Oswald';
import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadRoboto } from '@remotion/google-fonts/Roboto';
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';

/**
 * The creator's brand sheet (EDITOR_FEATURES_V2): their own accent colors and two fonts, applied to the
 * whole edit. The backend sends `brand` in the composition props (service/editor/skills.js BRAND_FONTS
 * lists the same fonts). Fonts load only when the edit uses them; a failed load falls back to the
 * standard fonts instead of failing the edit.
 */
export interface Brand {
  accent?: string;
  secondary?: string;
  displayFont?: string;
  bodyFont?: string;
}

/** WCAG relative luminance of a 6-digit hex color (0 black to 1 white). */
export function luminance(hex: string): number {
  const lin = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5);
}

/** Near-black or white text, whichever reads better on a surface filled with `accent` (any other color string gets near-black). */
export function textOn(accent: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(accent)) return '#0a0a0f';
  const l = luminance(accent);
  const dark = (l + 0.05) / (luminance('#0A0A0F') + 0.05);
  const light = 1.05 / (l + 0.05);
  return dark >= light ? '#0a0a0f' : '#ffffff';
}

const w = <const T extends readonly string[]>(weights: T) => ({ weights: [...weights] as never[], subsets: ['latin'] as never[] });
const SINGLE = w(['400']);
const BOLD = w(['700', '800']);
// Weights the captions use go up to 900 where the font has them; single-weight fonts are never faux-bolded (EditComposition sets font-synthesis: none).
const HEAVY = w(['700', '800', '900']);

const LOADERS: Record<string, () => string> = {
  Anton: () => loadAnton('normal', SINGLE).fontFamily,
  'Archivo Black': () => loadArchivoBlack('normal', SINGLE).fontFamily,
  Bangers: () => loadBangers('normal', SINGLE).fontFamily,
  'Bebas Neue': () => loadBebasNeue('normal', SINGLE).fontFamily,
  'DM Sans': () => loadDmSans('normal', w(['700'])).fontFamily,
  Fredoka: () => loadFredoka('normal', w(['600', '700'])).fontFamily,
  Inter: () => loadInter('normal', HEAVY).fontFamily,
  Lora: () => loadLora('normal', w(['700'])).fontFamily,
  Manrope: () => loadManrope('normal', BOLD).fontFamily,
  Montserrat: () => loadMontserrat('normal', HEAVY).fontFamily,
  Oswald: () => loadOswald('normal', w(['500', '700'])).fontFamily,
  Outfit: () => loadOutfit('normal', HEAVY).fontFamily,
  'Playfair Display': () => loadPlayfair('normal', HEAVY).fontFamily,
  Poppins: () => loadPoppins('normal', HEAVY).fontFamily,
  Roboto: () => loadRoboto('normal', w(['700', '900'])).fontFamily,
  'Space Grotesk': () => loadSpaceGrotesk('normal', w(['500', '700'])).fontFamily,
};

export const BRAND_FONT_NAMES = Object.keys(LOADERS);

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHex = (v: unknown): v is string => typeof v === 'string' && HEX.test(v);

/** The font stack for a brand font name, or null when it is unknown or fails to load. */
export function brandFont(name: string | undefined, fallback: string): string | null {
  if (!name || !Object.hasOwn(LOADERS, name)) return null;
  try {
    return `"${LOADERS[name]()}", ${fallback}`;
  } catch {
    return null;
  }
}

/** CSS variables the standard captions and graphics read (see fonts.ts); empty without a brand. */
export function brandVars(brand: Brand | undefined): Record<string, string> {
  if (!brand) return {};
  const body = brandFont(brand.bodyFont, 'Arial, sans-serif');
  const display = brandFont(brand.displayFont, 'Impact, "Arial Black", sans-serif');
  return {
    ...(body ? { '--brand-body': body } : {}),
    ...(display ? { '--brand-display': display } : {}),
  };
}
