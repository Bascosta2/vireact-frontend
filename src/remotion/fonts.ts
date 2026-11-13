import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';

/**
 * Fonts for captions and graphics. Loaded from Google Fonts in both the preview and the Lambda render
 * (the render waits for them), so text looks the same everywhere instead of falling back to whatever
 * the render machine has installed.
 */
const montserrat = loadMontserrat('normal', { weights: ['700', '800', '900'], subsets: ['latin'] });
const anton = loadAnton('normal', { weights: ['400'], subsets: ['latin'] });

export const FONT = `${montserrat.fontFamily}, "Helvetica Neue", Arial, sans-serif`;
export const DISPLAY = `${anton.fontFamily}, Impact, "Arial Black", sans-serif`;
