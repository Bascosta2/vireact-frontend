/** Kept out of LandingV3.tsx so the router can read the flag without pulling the page into the main bundle. */
export const isLandingV3Enabled = (): boolean =>
  String(import.meta.env.VITE_LANDING_V3 ?? '').toLowerCase() === 'true';
