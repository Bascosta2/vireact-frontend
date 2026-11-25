import { ageLabel, getAdminModelHealth, ownerConsoleUrl } from '@/api/admin';
import { VITE_BACKEND_URL } from '@/constants';
import { CARD, useAdminData } from './useAdminData';

function ModelTab() {
  const { data, error, loading } = useAdminData(getAdminModelHealth);
  if (loading) return <p role="status">Loading...</p>;
  if (error || !data) return <p role="alert">{error}</p>;
  const ingest = data.research.recentRuns[0];
  return (
    <section aria-label="Model health" className="space-y-3">
      <div className={CARD}>
        <h3 className="font-semibold">Latest learning run</h3>
        <p className="text-sm text-fg-muted">{data.latestRun ? `${ageLabel(data.latestRun.startedAt)}, ${data.latestRun.ok ? 'ok' : 'did not finish ok'}` : 'No runs yet'} (learning {data.learningEnabled ? 'on' : 'off'})</p>
      </div>
      <div className={CARD}>
        <h3 className="font-semibold">Model</h3>
        <p className="text-sm text-fg-muted">{data.model ? `v${data.model.version}, ${data.model.status}, trained ${ageLabel(data.model.trainedAt)} on ${data.model.n} rows` : 'No model trained yet'}</p>
      </div>
      <div className={CARD}>
        <h3 className="font-semibold">Research ingest</h3>
        <p className="text-sm text-fg-muted">{ingest ? `Last run ${ageLabel(ingest.startedAt)} (${ingest.status})` : 'No runs yet'} (ingest {data.research.enabled ? 'on' : 'off'})</p>
      </div>
      <a className="btn-outline inline-block" href={ownerConsoleUrl(VITE_BACKEND_URL)} target="_blank" rel="noopener noreferrer">Open the owner console</a>
    </section>
  );
}

export default ModelTab;
