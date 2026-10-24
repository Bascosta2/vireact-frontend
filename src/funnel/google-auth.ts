import Axios from '@/api';
import { isFunnelV2Enabled } from './cta';
import { buildGoogleAuthUrl } from './redirect';
import { getFunnelSessionId } from './session';
import { getAttribution } from './attribution';

/** Backend Google OAuth URL; carries the quiz session and attribution when Funnel V2 is on. */
export const googleAuthUrl = (redirectUrl: string): string =>
  buildGoogleAuthUrl(
    String(Axios.defaults.baseURL),
    redirectUrl,
    isFunnelV2Enabled() ? { sessionId: getFunnelSessionId(), attribution: getAttribution() } : undefined
  );
