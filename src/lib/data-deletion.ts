import { VITE_BACKEND_URL } from '@/constants';

/** Status of a data deletion request, as returned by GET /api/v1/meta/data-deletion/:code. */
export type DeletionStatus =
  | { kind: 'pending' }
  | { kind: 'completed'; completedAt: string | null }
  | { kind: 'not-found' }
  | { kind: 'error' };

/** Reads the backend's `{ status, completedAt? }` body (optionally wrapped in `data`). Anything else is an error. */
export function parseDeletionStatus(body: unknown): DeletionStatus {
  if (!body || typeof body !== 'object') return { kind: 'error' };
  const raw = body as { status?: unknown; completedAt?: unknown; data?: unknown };
  const inner = raw.status === undefined && raw.data && typeof raw.data === 'object' ? (raw.data as typeof raw) : raw;
  if (inner.status === 'pending') return { kind: 'pending' };
  if (inner.status !== 'completed') return { kind: 'error' };
  const completedAt = typeof inner.completedAt === 'string' && !Number.isNaN(Date.parse(inner.completedAt)) ? inner.completedAt : null;
  return { kind: 'completed', completedAt };
}

/** Looks up a deletion request by its confirmation code. Never throws: a 404 or a network failure becomes a result. */
export async function fetchDeletionStatus(code: string, signal?: AbortSignal): Promise<DeletionStatus> {
  if (!code.trim() || !VITE_BACKEND_URL) return { kind: 'error' };
  try {
    const res = await fetch(`${VITE_BACKEND_URL}/api/v1/meta/data-deletion/${encodeURIComponent(code.trim())}`, { signal });
    if (res.status === 404) return { kind: 'not-found' };
    if (!res.ok) return { kind: 'error' };
    return parseDeletionStatus(await res.json());
  } catch {
    return { kind: 'error' };
  }
}
