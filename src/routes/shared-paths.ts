/** Routes served in both auth trees (quiz and results), only when Funnel V2 is on. */
export const SHARED_PATH_PREFIX = '/start';

export const isSharedPath = (pathname: string): boolean =>
  pathname === SHARED_PATH_PREFIX || pathname.startsWith(`${SHARED_PATH_PREFIX}/`);
