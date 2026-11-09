import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { PageHeader } from '@/components/app/PageHeader';
import { ButtonLink } from '@/components/app/Button';
import { Tabs, type TabDef } from '@/components/app/Tabs';
import { PerformanceLogDialog } from '@/components/domain/PerformanceLog';
import { track } from '@/lib/analytics';
import OverviewTab from './OverviewTab';
import VideosTab from './VideosTab';
import StrategyTab from './StrategyTab';

type TabId = 'overview' | 'videos' | 'strategy';
const TABS: TabDef<TabId>[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'videos', label: 'Videos & results' },
  { id: 'strategy', label: 'Strategy' },
];
const isTab = (v: string | null): v is TabId => TABS.some((t) => t.id === v);

export type OpenLog = (videoId: string, title: string) => void;

/**
 * Analytics hub: progress over time (Overview), real results per video (Videos & results) and the
 * AI content plan built from them (Strategy). Tab and an open "log results" dialog live in the URL
 * (?tab=videos&log=<videoId>) so other pages can deep-link here.
 */
function Analytics() {
  const [params, setParams] = useSearchParams();
  const tab: TabId = isTab(params.get('tab')) ? (params.get('tab') as TabId) : 'overview';
  const logId = params.get('log');
  const [logTitle, setLogTitle] = useState('Your video');
  // Bumped after any result is saved, so every tab refetches.
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    track('analytics_viewed', { tab });
  }, [tab]);

  const setTab = (next: TabId) => {
    const p = new URLSearchParams(params);
    p.set('tab', next);
    p.delete('log');
    setParams(p, { replace: true });
  };

  const openLog: OpenLog = useCallback(
    (videoId, title) => {
      setLogTitle(title);
      const p = new URLSearchParams(params);
      p.set('log', videoId);
      setParams(p, { replace: true });
    },
    [params, setParams]
  );

  const closeLog = () => {
    const p = new URLSearchParams(params);
    p.delete('log');
    setParams(p, { replace: true });
  };

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Analytics"
          subtitle="Track how your scores and real views change over time, and get a posting plan built from your own results."
          actions={
            <ButtonLink to="/new" variant="secondary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New analysis
            </ButtonLink>
          }
        />
        <Tabs tabs={TABS} value={tab} onChange={setTab} label="Analytics sections">
          {tab === 'overview' && <OverviewTab onLog={openLog} dataVersion={dataVersion} onShowVideos={() => setTab('videos')} />}
          {tab === 'videos' && <VideosTab onLog={openLog} dataVersion={dataVersion} />}
          {tab === 'strategy' && <StrategyTab onLog={openLog} dataVersion={dataVersion} />}
        </Tabs>
      </div>
      <PerformanceLogDialog
        videoId={logId}
        title={logTitle}
        open={Boolean(logId)}
        onClose={closeLog}
        onChanged={() => setDataVersion((v) => v + 1)}
      />
    </UserPage>
  );
}

export default Analytics;
