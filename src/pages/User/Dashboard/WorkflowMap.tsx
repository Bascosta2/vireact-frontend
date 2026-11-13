import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, MessageSquareText, Sparkles, TrendingUp, Wand2, type LucideIcon } from 'lucide-react';
import { track } from '@/lib/analytics';
import { nextWorkflowStep, workflowSteps, type WorkflowData, type WorkflowStepId } from './workflow-steps';

/* ─── Mini pictures of each feature (decorative) ─────────────────────────────── */

const VISUAL = 'relative h-16 overflow-hidden rounded-lg border border-line bg-canvas px-3 py-2.5';

function AnalyzeVisual() {
  const bars = [
    { k: 'Hook', v: 46, c: 'bg-warning' },
    { k: 'Pacing', v: 72, c: 'bg-accent' },
    { k: 'Audio', v: 84, c: 'bg-success' },
    { k: 'Captions', v: 58, c: 'bg-accent' },
  ];
  return (
    <div className={`${VISUAL} flex items-center gap-3`}>
      <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0 -rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--app-border-subtle)" strokeWidth="4" />
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--app-accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray="100.5" strokeDashoffset="38" />
      </svg>
      <div className="grid flex-1 gap-1">
        {bars.map((b) => (
          <span key={b.k} className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <span className={`block h-full rounded-full ${b.c}`} style={{ width: `${b.v}%` }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function FixVisual() {
  return (
    <div className={`${VISUAL} flex flex-col justify-between`}>
      <div className="relative h-1.5 rounded-full bg-white/[0.08]">
        <span className="absolute top-1/2 left-[8%] h-3 w-3 -translate-y-1/2 rounded-full border-2 border-canvas bg-warning" />
        <span className="absolute top-1/2 left-[62%] h-3 w-3 -translate-y-1/2 rounded-full border-2 border-canvas bg-warning" />
      </div>
      <span className="w-fit max-w-full truncate rounded-md bg-accent-tint px-2 py-0.5 text-[11px] font-medium text-accent">0:01 · Open on the result</span>
    </div>
  );
}

function EditVisual() {
  const parts = [3, 0.8, 4, 0.9, 3];
  return (
    <div className={`${VISUAL} flex flex-col justify-between`}>
      <div className="flex h-3 gap-0.5">
        {parts.map((g, i) => (
          <span
            key={i}
            style={{ flexGrow: g }}
            className={
              i % 2
                ? 'rounded-sm bg-[repeating-linear-gradient(135deg,rgba(255,99,105,0.6)_0_3px,transparent_3px_6px)]'
                : 'rounded-sm bg-accent/60'
            }
          />
        ))}
      </div>
      <span className="w-fit rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold tracking-tight text-fg">
        AT <span className="text-warning">5AM</span> EVERY DAY
      </span>
    </div>
  );
}

function GrowVisual() {
  return (
    <div className={VISUAL}>
      <svg viewBox="0 0 120 40" preserveAspectRatio="none" className="h-full w-full">
        <polyline points="0,34 20,30 40,32 60,22 80,24 100,12 120,6" fill="none" stroke="var(--app-success)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <polyline points="0,34 20,30 40,32 60,22 80,24 100,12 120,6 120,40 0,40" fill="var(--app-success)" opacity="0.12" />
      </svg>
    </div>
  );
}

/** Icon and picture for each step; copy lives in workflow-steps.ts. */
const STEP_VIEW: Record<WorkflowStepId, { Icon: LucideIcon; Visual: () => ReactElement }> = {
  analyze: { Icon: Sparkles, Visual: AnalyzeVisual },
  fix: { Icon: MessageSquareText, Visual: FixVisual },
  edit: { Icon: Wand2, Visual: EditVisual },
  grow: { Icon: TrendingUp, Visual: GrowVisual },
};

/* ─── Map ───────────────────────────────────────────────────────────────────── */

/**
 * Home: the app as four connected steps (analyze, fix, edit, grow). Each step says what it does in one
 * line, shows a tiny picture of it, the creator's live status and one link. The step that makes most
 * sense next is highlighted.
 */
export function WorkflowMap({ data, headingId }: { data: WorkflowData; headingId: string }) {
  const steps = workflowSteps(data);
  const next = nextWorkflowStep(data);

  return (
    <ol aria-labelledby={headingId} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
      {steps.map((s, i) => {
        const isNext = s.id === next;
        const { Icon, Visual } = STEP_VIEW[s.id];
        return (
          <li
            key={s.id}
            className={`group relative flex min-w-0 flex-col rounded-xl border bg-surface p-4 transition-colors hover:bg-surface-raised ${
              isNext ? 'border-accent/60 shadow-[0_0_0_1px_var(--app-accent-tint),0_8px_32px_-8px_rgba(232,103,53,0.35)]' : 'border-line'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isNext ? 'bg-accent text-on-brand' : 'bg-accent-tint text-accent'}`} aria-hidden="true">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="app-label">
                <span className="tabular">{i + 1}</span> · {s.label}
              </span>
              {isNext && <span className="ml-auto rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-semibold text-accent">Next step</span>}
            </div>

            <h3 className="mt-3 text-base font-semibold text-fg">{s.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">{s.body}</p>

            {/* Pinned to the bottom so pictures and links line up across a row. */}
            <div className="mt-auto pt-4" aria-hidden="true">
              <Visual />
            </div>

            <p className="mt-3 truncate text-xs text-fg-subtle" title={s.status}>
              {s.status}
            </p>
            <Link
              to={s.cta.to}
              onClick={() => track('cta_clicked', { location: `home_workflow_${s.id}` })}
              className={`app-focus mt-3 inline-flex items-center gap-1.5 self-start rounded-lg text-sm font-semibold after:absolute after:inset-0 after:rounded-xl after:content-[''] ${
                isNext ? 'bg-accent px-3 py-2 text-on-brand' : 'text-accent group-hover:underline'
              }`}
            >
              {s.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {i < steps.length - 1 && (
              <span
                className={`pointer-events-none absolute z-10 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-canvas text-fg-subtle -bottom-[22px] left-1/2 -translate-x-1/2 xl:top-1/2 xl:-right-[20px] xl:bottom-auto xl:left-auto xl:translate-x-0 xl:-translate-y-1/2 ${
                  i === 1 ? 'sm:hidden xl:flex' : ''
                } ${i === 0 || i === 2 ? 'sm:top-1/2 sm:-right-[22px] sm:bottom-auto sm:left-auto sm:translate-x-0 sm:-translate-y-1/2' : ''}`}
                aria-hidden="true"
              >
                <ChevronDown className="h-3.5 w-3.5 sm:hidden" />
                <ChevronRight className="hidden h-3.5 w-3.5 sm:block" />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
