import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, ButtonLink } from './Button';
import { cn } from '@/lib/utils';

export type AnalysisStage = 'uploading' | 'preparing' | 'analyzing' | 'ready' | 'failed';

const STEPS: { id: Exclude<AnalysisStage, 'ready' | 'failed'>; label: string }[] = [
  { id: 'uploading', label: 'Uploading' },
  { id: 'preparing', label: 'Preparing your video' },
  { id: 'analyzing', label: 'Analyzing' },
];

const formatElapsed = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export type NotifyState = 'idle' | 'on' | 'denied' | 'unsupported';

type ProgressPanelProps = {
  stage: AnalysisStage;
  uploadPercent: number;
  startedAt: number;
  fileName: string;
  videoId?: string | null;
  errorMessage?: string | null;
  notifyState: NotifyState;
  onNotify: () => void;
  onRetry?: () => void;
  onStartOver?: () => void;
};

/**
 * Live status of one analysis. The backend reports no per-stage percentages after upload,
 * so only the upload step shows a number; later steps show elapsed time.
 */
export function ProgressPanel({
  stage,
  uploadPercent,
  startedAt,
  fileName,
  videoId,
  errorMessage,
  notifyState,
  onNotify,
  onRetry,
  onStartOver,
}: ProgressPanelProps) {
  const [now, setNow] = useState(() => Date.now());
  const running = stage !== 'ready' && stage !== 'failed';

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  const activeIndex = STEPS.findIndex((s) => s.id === stage);

  if (stage === 'ready') {
    return (
      <section role="status" className="rounded-xl border border-line bg-surface p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-fg">Analysis ready</h2>
            <p className="mt-1 truncate text-sm text-fg-muted">{fileName}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to={videoId ? `/videos/${videoId}` : '/videos'}>Open results</ButtonLink>
          {onStartOver && (
            <Button variant="secondary" onClick={onStartOver}>
              Analyze another video
            </Button>
          )}
        </div>
      </section>
    );
  }

  if (stage === 'failed') {
    return (
      <section role="alert" className="rounded-xl border border-danger/50 bg-surface p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-danger" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-fg">Analysis did not finish</h2>
            <p className="mt-1 text-sm text-fg-muted">{errorMessage || 'Something went wrong. Try again.'}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {onRetry && <Button onClick={onRetry}>Try again</Button>}
          {onStartOver && (
            <Button variant="secondary" onClick={onStartOver}>
              Choose another video
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section role="status" aria-live="polite" className="rounded-xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-fg">Analyzing your video</h2>
        <span className="tabular text-sm text-fg-muted" aria-label={`Elapsed ${formatElapsed(now - startedAt)}`}>
          {formatElapsed(now - startedAt)}
        </span>
      </div>
      <p className="mt-1 truncate text-sm text-fg-muted">{fileName}</p>

      <ol className="mt-6 space-y-3">
        {STEPS.map((step, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li key={step.id} className="flex items-center gap-3" aria-current={active ? 'step' : undefined}>
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                  done && 'border-success bg-success text-on-brand',
                  active && 'border-accent text-accent',
                  !done && !active && 'border-control text-fg-subtle'
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={cn('text-sm', active ? 'font-medium text-fg' : done ? 'text-fg-muted' : 'text-fg-subtle')}>
                {step.label}
                {done && <span className="sr-only"> (done)</span>}
              </span>
              {active && step.id === 'uploading' && (
                <span className="tabular ml-auto text-sm text-fg-muted">{Math.round(uploadPercent)}%</span>
              )}
            </li>
          );
        })}
      </ol>

      {stage === 'uploading' && (
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="Upload progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(uploadPercent)}
        >
          <div
            className="h-full origin-left rounded-full bg-accent transition-transform duration-200 ease-app-out"
            style={{ transform: `scaleX(${Math.max(0.02, uploadPercent / 100)})` }}
          />
        </div>
      )}

      <p className="mt-6 text-sm text-fg-muted">Usually 2 to 5 minutes. You can leave this page. We'll keep working.</p>

      <div className="mt-4">
        {notifyState === 'on' ? (
          <p className="inline-flex items-center gap-2 text-sm text-fg-muted">
            <Bell className="h-4 w-4 text-success" aria-hidden="true" />
            We'll notify you when it's done.
          </p>
        ) : notifyState === 'denied' ? (
          <p className="inline-flex items-center gap-2 text-sm text-fg-muted">
            <BellOff className="h-4 w-4" aria-hidden="true" />
            Notifications are blocked in this browser.
          </p>
        ) : notifyState === 'unsupported' ? null : (
          <Button variant="secondary" size="sm" onClick={onNotify}>
            <Bell className="h-4 w-4" aria-hidden="true" />
            Notify me when it's done
          </Button>
        )}
      </div>
    </section>
  );
}
