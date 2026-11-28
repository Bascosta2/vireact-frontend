/**
 * Helpers for deciding whether a storyboard scene's subject should draw via SubjectDraw, Mascot, or neither.
 * Mirrors the backend word-fold used by subjectMatchesMascot.
 */

export const foldWord = (w: string) => String(w).toLowerCase().replace(/ies$/, 'y').replace(/s$/, '');

/** Normalize a subject / visual id to a comparable token. */
export const foldId = (id: string) => foldWord(String(id ?? '').trim().replace(/[\s-]+/g, '_'));

/** True when `subject` (name or visual id) is listed in the vocabulary (plural-folded). */
export function inVocabulary(subject: string | undefined, vocabulary: string[] | undefined): boolean {
  if (!subject || !vocabulary?.length) return false;
  const needle = foldId(subject);
  if (!needle) return false;
  return vocabulary.some((v) => foldId(v) === needle || foldWord(v) === foldWord(subject));
}

/** True when any word in the subject overlaps the mascot vocabulary. */
export function subjectMatchesMascot(subject: string | undefined, mascotSubjects: string[] | undefined): boolean {
  if (!mascotSubjects?.length) return true;
  if (!subject) return true;
  const words = new Set(String(subject).split(/\s+/).filter(Boolean).map(foldWord));
  return mascotSubjects.some((m) => words.has(foldWord(m)));
}
