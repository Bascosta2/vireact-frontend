import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, Lock, Plus, Sparkles } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { PageHeader } from '@/components/app/PageHeader';
import { Button, ButtonLink } from '@/components/app/Button';
import Fallback from '@/components/Fallback';
import { getUserVideos, type Video } from '@/api/video';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { VIDEO_VIEW_SUFFIX, type VideoViewId } from '@/lib/app-nav';
import { SCRIPT_IDEAS_PER_VIDEO, scriptAccessForPlan } from '@/lib/plan-limits';
import { pickHubVideo, readLastVideo } from '@/lib/video-hub';
import { cleanVideoTitle } from '@/lib/video-file';

const COPY: Record<VideoViewId, { title: string; subtitle: string; pitch: string }> = {
  report: {
    title: 'Feedback Reports',
    subtitle: 'A score, predicted views and timestamped fixes for every video you analyze.',
    pitch: 'Analyze a video to get your first Feedback Report.',
  },
  coach: {
    title: 'AI Coach',
    subtitle: 'A coach that has watched your video and answers questions about it.',
    pitch: 'Analyze a video and the coach is ready to talk it through with you.',
  },
  scripts: {
    title: 'Scripts',
    subtitle: `${SCRIPT_IDEAS_PER_VIDEO} script ideas written for each video, ready to film.`,
    pitch: `Analyze a video to get ${SCRIPT_IDEAS_PER_VIDEO} script ideas fitted to it.`,
  },
};

const SAMPLE_IDEAS = ['Score first', 'Bold claim', 'Big question', 'Common mistake', 'Three steps', 'Mid story', 'Myth buster', 'Before after', 'Your turn', 'Held back'];

function SampleBadge() {
  return (
    <span className="absolute right-3 top-3 rounded-full border border-line bg-canvas/80 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
      Sample
    </span>
  );
}

function ReportSample() {
  const fixes = [
    ['0:00', 'Hook', 'Open on the result, not the setup. You lose a third of viewers in the first two seconds.'],
    ['0:07', 'Pacing', 'Cut the pause after "so basically". Nothing new happens for 1.8 seconds.'],
    ['0:15', 'Caption', 'Your caption covers the product. Move it to the top third.'],
  ];
  return (
    <div className="app-panel relative p-5">
      <SampleBadge />
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-success/70 text-2xl font-semibold text-fg tabular">78</div>
        <div>
          <p className="app-label">Virality score</p>
          <p className="mt-1 text-base font-semibold text-fg">Strong video, two fixes from great</p>
          <p className="mt-1 text-sm text-fg-muted">Predicted 12K to 30K views</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {fixes.map(([time, area, text]) => (
          <li key={time} className="flex gap-3 rounded-lg border border-line bg-white/[0.02] p-3 text-sm">
            <span className="font-mono text-xs text-accent tabular">{time}</span>
            <span className="min-w-0">
              <span className="font-medium text-fg">{area}: </span>
              <span className="text-fg-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoachSample() {
  return (
    <div className="app-panel relative space-y-3 p-5">
      <SampleBadge />
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md border border-accent/30 bg-accent-tint px-4 py-2.5 text-sm text-fg">
        Why did people drop off at 0:07?
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white/[0.03] px-4 py-2.5 text-sm leading-relaxed text-fg-muted">
        At 0:07 you pause for almost two seconds and repeat the setup. Cut from "so basically" straight to the reveal, and keep
        the on-screen text up while you do it.
      </div>
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md border border-accent/30 bg-accent-tint px-4 py-2.5 text-sm text-fg">
        Give me a stronger first line.
      </div>
    </div>
  );
}

function ScriptsSample({ open }: { open: number }) {
  return (
    <div className="app-panel relative p-5">
      <SampleBadge />
      <div className="flex flex-wrap gap-2 pr-16">
        {SAMPLE_IDEAS.map((idea, i) => (
          <span
            key={idea}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium ${
              i === 0 ? 'border-accent/50 bg-accent-tint text-fg' : 'border-line bg-white/[0.02] text-fg-muted'
            }`}
          >
            {i >= open && <Lock className="h-3 w-3" aria-label="Locked" />}
            {idea}
          </span>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-line bg-white/[0.02] p-4 text-sm">
        <p className="app-label">Hook</p>
        <p className="mt-1 font-medium text-fg">"I scored my own video 41 out of 100. Here is what fixed it."</p>
        <p className="mt-3 text-fg-muted">
          <span className="font-mono text-xs text-accent">0:00-0:03</span> Show the score on screen, then cut to you.
        </p>
      </div>
      <p className="mt-3 text-xs text-fg-subtle">
        {open >= SCRIPT_IDEAS_PER_VIDEO
          ? `All ${SCRIPT_IDEAS_PER_VIDEO} full scripts open on your plan.`
          : `${open} of ${SCRIPT_IDEAS_PER_VIDEO} full scripts open on your plan. Every idea name is shown.`}
      </p>
    </div>
  );
}

/**
 * Sidebar entry for one view of an analysed video. It opens that view on the video the person last
 * opened, or on their newest analysed video. With nothing analysed yet it shows a sample of the view.
 */
export default function VideoHub({ view }: { view: VideoViewId }) {
  const { plan } = useSubscription();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setVideos(null);
    getUserVideos({ summary: true })
      .then(setVideos)
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  if (!videos && !error) return <Fallback />;

  const { open, running } = pickHubVideo(videos ?? [], readLastVideo());
  if (open) return <Navigate to={`/videos/${open._id}${VIDEO_VIEW_SUFFIX[view]}`} replace />;

  const copy = COPY[view];
  return (
    <UserPage>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-10">
        <PageHeader title={copy.title} subtitle={copy.subtitle} />

        {error ? (
          <div role="alert" className="mb-6 rounded-xl border border-danger/40 bg-surface p-5">
            <p className="text-sm font-medium text-fg">We couldn't load your videos.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={load}>
              Try again
            </Button>
          </div>
        ) : running ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/[0.06] p-4" role="status">
            <Loader2 className="h-5 w-5 shrink-0 text-warning motion-safe:animate-spin" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm text-fg">
              <span className="font-medium">{cleanVideoTitle(running.filename ?? "Your video")}</span> is being analyzed. It opens here when it's ready.
            </p>
            <ButtonLink to={`/videos/${running._id}`} variant="secondary" size="sm">
              View
            </ButtonLink>
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-accent/30 bg-accent-tint p-5 sm:flex-row sm:items-center">
            <Sparkles className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm text-fg">{copy.pitch}</p>
            <ButtonLink to="/new" size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Analyze your first video
            </ButtonLink>
          </div>
        )}

        <p className="app-label mb-3">What you get</p>
        {view === 'report' && <ReportSample />}
        {view === 'coach' && <CoachSample />}
        {view === 'scripts' && <ScriptsSample open={scriptAccessForPlan(plan)} />}
      </div>
    </UserPage>
  );
}
