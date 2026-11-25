/** "Updated just now", "Updated 4 min ago". */
export function updatedLabel(at: number | null | undefined, now = Date.now()): string | null {
  if (!at) return null;
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 45) return 'Updated just now';
  const m = Math.round(s / 60);
  if (m < 60) return `Updated ${m} min ago`;
  const h = Math.round(m / 60);
  return `Updated ${h} h ago`;
}
