import { activeSubscriptions, getAdminOverview, planRows } from '@/api/admin';
import { CARD, useAdminData } from './useAdminData';

interface StatProps {
  label: string;
  value: number | string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className={CARD}>
      <dt className="text-sm text-fg-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
    </div>
  );
}

function OverviewTab() {
  const { data, error, loading } = useAdminData(getAdminOverview);
  if (loading) return <p role="status">Loading...</p>;
  if (error || !data) return <p role="alert">{error}</p>;
  return (
    <section aria-label="Overview" className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Users" value={data.users} />
        <Stat label="New this week" value={data.usersWeek} />
        <Stat label="Active subscriptions" value={activeSubscriptions(data.plans)} />
        <Stat label="Errors (24h)" value={data.errors24h} />
        <Stat label="Analyses today" value={data.analysesToday} />
        <Stat label="Analyses (7d)" value={data.analyses7d} />
        <Stat label="Failed (7d)" value={data.failed7d} />
        <Stat label="In progress" value={data.processing} />
      </dl>
      <div className={CARD}>
        <h3 className="font-semibold">Users by plan</h3>
        <ul className="mt-2 text-sm">
          {planRows(data.plans).map((r) => <li key={r.plan} className="flex justify-between"><span className="capitalize">{r.plan}</span><span>{r.count}</span></li>)}
        </ul>
      </div>
      <div className={CARD}>
        <h3 className="font-semibold">System health: {data.health.status}</h3>
        <p className="mt-1 text-sm text-fg-muted">Database {data.health.database}, up {data.health.uptimeMinutes} min, {data.health.analysisJobs} analysis jobs running.</p>
      </div>
    </section>
  );
}

export default OverviewTab;
