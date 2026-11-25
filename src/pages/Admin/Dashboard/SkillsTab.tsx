import { getAdminSkills } from '@/api/admin';
import { CARD, useAdminData } from './useAdminData';

function SkillsTab() {
  const { data, error, loading } = useAdminData(getAdminSkills);
  if (loading) return <p role="status">Loading...</p>;
  if (error || !data) return <p role="alert">{error}</p>;
  return (
    <section aria-label="Skills" className="space-y-6">
      <div className={CARD}>
        <h3 className="font-semibold">Editor skills</h3>
        <ul className="mt-2 text-sm">{data.skills.map((s) => <li key={s.id}>{s.name} (v{s.version})</li>)}</ul>
      </div>
      <div className={CARD}>
        <h3 className="font-semibold">Animation styles</h3>
        <ul className="mt-2 text-sm">{data.animationStyles.map((s) => <li key={s.id}>{s.name} <span className="text-fg-muted">- {s.bestFor}</span></li>)}</ul>
      </div>
      <div className={CARD}>
        <h3 className="font-semibold">Beta allow-lists</h3>
        <p className="mt-1 text-sm text-fg-muted">Editor: {data.betaAllowLists.editor} accounts. Accounts tab: {data.betaAllowLists.accounts} accounts.</p>
      </div>
    </section>
  );
}

export default SkillsTab;
