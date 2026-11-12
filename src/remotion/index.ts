import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

// Bundle entry for Remotion Lambda (`remotion lambda sites create src/remotion/index.ts`).
// The web app imports EditComposition directly for the in-browser preview and never loads this file.
registerRoot(RemotionRoot);
