import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquareText, Sparkles, TrendingUp, Wand2, type LucideIcon } from 'lucide-react';
import { ButtonLink } from '@/components/app/Button';
import { track } from '@/lib/analytics';
import { workflowProgress, workflowSpotlight, workflowSteps, type WorkflowData, type WorkflowStepId } from './workflow-steps';
import './workflow.css';

const ICONS: Record<WorkflowStepId, LucideIcon> = {
  analyze: Sparkles,
  fix: MessageSquareText,
  edit: Wand2,
  grow: TrendingUp,
};

type NodeState = 'done' | 'next' | 'upcoming';

function Orb({ Icon, state }: { Icon: LucideIcon; state: NodeState }) {
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center" aria-hidden="true">
      {state === 'next' && (
        <>
          <span className="wf-ring absolute inset-0 rounded-full" />
          <span className="absolute inset-[2px] rounded-full bg-surface shadow-[0_0_28px_rgba(232,103,53,0.45)]" />
        </>
      )}
      {state === 'done' && <span className="absolute inset-0 rounded-full border border-accent/45 bg-accent-tint" />}
      {state === 'upcoming' && <span className="absolute inset-0 rounded-full border border-line bg-canvas" />}
      <Icon className={`relative h-6 w-6 ${state === 'upcoming' ? 'text-fg-subtle' : 'text-accent'}`} />
    </span>
  );
}

/**
 * Home: the app as one pipeline (analyze, fix, edit, grow). The trail is lit up to the creator's next
 * step, which spins; every step links to its feature. One spotlight underneath says what to do next.
 * New creators see the same pipeline, pointed at their first analysis.
 */
export function WorkflowMap({ data, headingId }: { data: WorkflowData; headingId: string }) {
  const steps = workflowSteps(data);
  const { next, done } = workflowProgress(data);
  const spotlight = workflowSpotlight(data);
  const nextIndex = steps.findIndex((s) => s.id === next);

  const stateOf = (id: WorkflowStepId): NodeState => (id === next ? 'next' : done.has(id) ? 'done' : 'upcoming');

  return (
    <section aria-labelledby={headingId} className="app-panel overflow-hidden">
      <div className="wf-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex items-center justify-between gap-4 px-5 pt-5 sm:px-6">
        <h2 id={headingId} className="app-label">
          Your workflow
        </h2>
        <span className="tabular font-mono text-xs text-fg-subtle" aria-hidden="true">
          {String(nextIndex + 1).padStart(2, '0')} / 04
        </span>
      </div>

      <ol className="relative flex flex-col px-3 pt-3 pb-4 sm:grid sm:grid-cols-4 sm:px-4 sm:pt-6 sm:pb-6">
        {steps.map((s, i) => {
          const state = stateOf(s.id);
          const lit = done.has(s.id);
          return (
            <li key={s.id} className="relative">
              {i < steps.length - 1 && (
                <span
                  className={`absolute top-[72px] -bottom-2 left-[39px] w-0.5 overflow-hidden rounded-full sm:top-[39px] sm:bottom-auto sm:left-[calc(50%+34px)] sm:h-0.5 sm:w-[calc(100%-68px)] ${
                    lit ? 'wf-trail' : 'bg-white/10'
                  }`}
                  aria-hidden="true"
                >
                  {lit && (
                    <span
                      className="wf-pulse absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-white/80 to-transparent sm:inset-x-auto sm:inset-y-0 sm:left-0 sm:h-auto sm:w-1/3 sm:bg-gradient-to-r"
                      style={{ animationDelay: `${i * 0.4}s` }}
                    />
                  )}
                </span>
              )}
              <Link
                to={s.to}
                aria-current={state === 'next' ? 'step' : undefined}
                onClick={() => track('cta_clicked', { location: `home_workflow_${s.id}` })}
                className="app-focus group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/[0.03] sm:flex-col sm:gap-3 sm:text-center"
              >
                <Orb Icon={ICONS[s.id]} state={state} />
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2 sm:justify-center">
                    <span className="tabular font-mono text-[11px] text-fg-subtle">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`text-base font-semibold ${state === 'upcoming' ? 'text-fg-muted group-hover:text-fg' : 'text-fg'}`}>{s.name}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-fg-muted sm:mx-auto sm:max-w-[24ch]">{s.line}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="relative flex flex-col gap-4 border-t border-line bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
            <span className="wf-dot h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {spotlight.eyebrow}
          </p>
          <p className="mt-1 text-base font-semibold text-fg">{spotlight.title}</p>
          <p className="mt-0.5 text-sm text-fg-muted">{spotlight.body}</p>
        </div>
        <ButtonLink
          to={spotlight.cta.to}
          className="shrink-0 self-start sm:self-auto"
          onClick={() => track('cta_clicked', { location: `home_workflow_spotlight_${next}` })}
        >
          {spotlight.cta.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    </section>
  );
}
