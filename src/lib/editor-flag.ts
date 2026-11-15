/**
 * Editor tab private beta, for pages shown to logged-out visitors (pricing, landing): 'true' once the
 * editor is public. Inside the app the backend decides per account (see editor-access.ts).
 * Kept free of imports so config and marketing code can read it without pulling in the API client.
 */
export const isEditorPublic = (): boolean =>
  String(import.meta.env.VITE_EDITOR_PUBLIC ?? '').trim().toLowerCase() === 'true';
