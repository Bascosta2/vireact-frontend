import { Link } from 'react-router-dom';
import { Film, Loader2, Lock, Sparkles } from 'lucide-react';
import { ButtonLink } from '@/components/app/Button';
import { track } from '@/lib/analytics';
import { formatDuration } from '@/lib/video-file';
import { IN_PROGRESS, type EditorUsage, type EditProjectSummary } from '@/api/editor';
import { isFreePlan, resetDate } from './usage';

/** Pieces shared by the Editor and the Skills Editor (same plan limits, same project cards). */

export const ACCEPT = '.mp4,.mov,.webm,.mkv,.m4v';
export const TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-m4v']);

export function UsagePill({ usage }: { usage: EditorUsage }) {
  const text = isFreePlan(usage)
    ? usage.canStart
      ? 'One AI edit per month on the free plan'
      : `Free AI edit used · next on ${resetDate(usage)}`
    : `${usage.remaining} of ${usage.limit} AI edits left this period`;
  return (
    <span className="tabular inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent-tint px-4 py-2 text-sm font-semibold text-accent">
      <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
      {text}
    </span>
  );
}

export function LockedCard({ usage }: { usage: EditorUsage }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
      <div aria-hidden="true" className="pointer-events-none grid select-none gap-4 p-6 blur-[6px] sm:grid-cols-2">
        <div className="aspect-[9/16] max-h-80 rounded-lg bg-gradient-to-b from-white/10 to-white/0" />
        <div className="space-y-3">
          {['Opened on the result', 'Removed 14 s of pauses and filler', 'Bold word captions', '3 punch-in zooms', 'Upbeat track under the voice'].map((t) => (
            <div key={t} className="rounded-lg border border-line p-3 text-sm text-fg">{t}</div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-canvas/40 p-4">
        <div className="max-w-md rounded-xl border border-line bg-surface-raised p-5 text-center shadow-xl">
          <Lock className="mx-auto h-6 w-6 text-accent" aria-hidden="true" />
          <h2 className="mt-2 text-base font-semibold text-fg">You&rsquo;ve used this month&rsquo;s free AI edit</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Your next free edit unlocks on {resetDate(usage)}. Premium and Pro include more AI edits every month: cuts, captions, zooms, a reworked hook, music and sound effects.
          </p>
          <ButtonLink to="/subscription-plans" className="mt-4" onClick={() => track('editor_upgrade_clicked', { from: 'editor_home' })}>
            See plans
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function ProjectCard({ p, base = '/editor' }: { p: EditProjectSummary; base?: string }) {
  const working = IN_PROGRESS.includes(p.status);
  return (
    <li>
      <Link to={`${base}/${p.id}`} className="app-focus group flex gap-3 rounded-xl border border-line bg-surface p-3 hover:bg-surface-raised">
        {p.thumbnailUrl ? (
          <img src={p.thumbnailUrl} alt="" loading="lazy" className="h-24 w-[54px] shrink-0 rounded-md bg-canvas object-cover" />
        ) : (
          <span className="flex h-24 w-[54px] shrink-0 items-center justify-center rounded-md bg-canvas text-fg-subtle">
            <Film className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-fg group-hover:underline">{p.title}</span>
          <span className="mt-1 block text-xs text-fg-muted">
            {working ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />
                {p.stage === 'uploading' ? 'Waiting for upload' : `${p.stage[0]?.toUpperCase()}${p.stage.slice(1)}`}
              </span>
            ) : p.status === 'failed' ? (
              <span className="text-danger">Didn&rsquo;t finish</span>
            ) : (
              <span className="tabular">
                {formatDuration(p.durationSec)} → {formatDuration(p.editedDurationSec)}
              </span>
            )}
          </span>
          {p.hasRender && <span className="mt-2 inline-block rounded-full border border-success/30 px-2 py-0.5 text-[11px] text-success">Exported</span>}
        </span>
      </Link>
    </li>
  );
}

