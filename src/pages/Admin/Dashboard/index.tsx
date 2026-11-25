import { lazy, Suspense, useCallback, useState } from 'react';
import Fallback from '@/components/Fallback';

const OverviewTab = lazy(() => import('./OverviewTab'));
const UsersTab = lazy(() => import('./UsersTab'));
const PromoTab = lazy(() => import('./PromoTab'));
const SkillsTab = lazy(() => import('./SkillsTab'));
const ModelTab = lazy(() => import('./ModelTab'));

const TABS = [
  { id: 'overview', label: 'Overview', Panel: OverviewTab },
  { id: 'users', label: 'Users', Panel: UsersTab },
  { id: 'promo', label: 'Promo codes', Panel: PromoTab },
  { id: 'skills', label: 'Skills', Panel: SkillsTab },
  { id: 'model', label: 'Model health', Panel: ModelTab },
] as const;

type TabId = (typeof TABS)[number]['id'];

function Dashboard() {
  const [active, setActive] = useState<TabId>('overview');
  const onTab = useCallback((e: React.MouseEvent<HTMLButtonElement>) => setActive(e.currentTarget.dataset.tab as TabId), []);
  const Panel = TABS.find((t) => t.id === active)!.Panel;

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-black px-4 py-8">
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="text-sm text-fg-muted">Read-only. Deep pages live in the owner console.</p>
      <div role="tablist" aria-label="Admin sections" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={active === t.id} aria-controls="admin-panel" data-tab={t.id} onClick={onTab} className={active === t.id ? 'btn-primary' : 'btn-outline'}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="admin-panel" aria-labelledby={`tab-${active}`} className="mt-6">
        <Suspense fallback={<Fallback />}><Panel /></Suspense>
      </div>
    </main>
  );
}

export default Dashboard;
