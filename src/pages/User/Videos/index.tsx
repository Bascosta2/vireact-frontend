import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Columns3, LayoutGrid, Library, List, Loader2, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { getUserVideos, deleteVideo, reanalyzeVideo, type Video } from '@/api/video';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';
import { UPLOAD_STATUS, ANALYSIS_STATUS } from '@/constants';
import VideoCard from '@/components/UI/VideoCard';
import { Button, ButtonLink, IconButton } from '@/components/app/Button';
import { EmptyState } from '@/components/app/EmptyState';
import { Skeleton } from '@/components/app/Skeleton';
import { useToast } from '@/components/app/Toast';
import { ANALYSIS_FEATURES_UI, featureLabel } from '@/data/analysis-features';
import { Select } from '@/components/app/Select';
import { InfoTip } from '@/components/app/InfoTip';
import { Popover } from '@/components/app/Popover';
import { VideoThumb } from '@/components/app/VideoThumb';
import { InlineRename } from '@/components/app/InlineRename';
import { StatusPill } from '@/components/app/StatusPill';
import { formatDuration, videoName } from '@/lib/video-file';
import { formatVideoDate, statusKind } from '@/lib/video-status';
import { matchesVideoQuery, parseVideoQuery, QUERY_HINTS, removeQueryToken, videoState } from '@/lib/video-query';
import { primeVideoSummaries, removeVideoSummary } from '@/lib/video-summaries';
import { PLATFORM_LABELS } from '@/pages/User/Analytics/labels';
import { ScoreBadge } from '@/pages/User/Dashboard/HomeWidgets';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type SortKey = 'date' | 'name' | 'score' | 'status' | 'length';
type SortDir = 'asc' | 'desc';
type StatusTab = 'all' | 'ready' | 'needs-views' | 'analyzing' | 'failed';
type ColumnId = 'score' | 'status' | 'date' | 'length' | 'platform';

const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'needs-views', label: 'Needs views' },
  { id: 'analyzing', label: 'Analyzing' },
  { id: 'failed', label: 'Failed' },
];

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: 'score', label: 'Score' },
  { id: 'status', label: 'Status' },
  { id: 'date', label: 'Date' },
  { id: 'length', label: 'Length' },
  { id: 'platform', label: 'Platform' },
];

const PAGE_SIZE = 24;
const PREFS_KEY = 'vireact_library_prefs_v1';
const IN_PROGRESS = [ANALYSIS_STATUS.PENDING, ANALYSIS_STATUS.QUEUED, ANALYSIS_STATUS.PROCESSING] as string[];

interface Prefs {
  view: 'grid' | 'list';
  columns: ColumnId[];
}

const readPrefs = (): Prefs => {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? 'null') as Partial<Prefs> | null;
    return {
      view: p?.view === 'list' ? 'list' : 'grid',
      columns: Array.isArray(p?.columns) ? (p.columns.filter((c) => COLUMNS.some((x) => x.id === c)) as ColumnId[]) : ['score', 'status', 'date', 'length'],
    };
  } catch {
    return { view: 'grid', columns: ['score', 'status', 'date', 'length'] };
  }
};

const inTab = (v: Video, tab: StatusTab) => {
  if (tab === 'all') return true;
  const state = videoState(v);
  if (tab === 'ready') return state === 'ready' || state === 'needs-views';
  return state === tab;
};

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as { message?: string })?.message || fallback;

function Videos() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [reanalyzingVideoId, setReanalyzingVideoId] = useState<string | null>(null);
  const { refreshPendingCount } = useActiveAnalyses();
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const [tab, setTab] = useState<StatusTab>(() => (STATUS_TABS.some((t) => t.id === params.get('status')) ? (params.get('status') as StatusTab) : 'all'));
  const [sortKey, setSortKey] = useState<SortKey>(() => (params.get('sort') === 'score' ? 'score' : 'date'));
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterFeature, setFilterFeature] = useState('all');
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const savePrefs = (next: Prefs) => {
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      // private window
    }
  };

  // Keep the search in the address so it can be shared and survives a refresh.
  useEffect(() => {
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (query.trim()) next.set('q', query.trim());
        else next.delete('q');
        if (tab !== 'all') next.set('status', tab);
        else next.delete('status');
        next.delete('sort');
        return next;
      },
      { replace: true }
    );
  }, [query, tab, setParams]);

  const fetchVideos = useCallback(async () => {
    setError(null);
    try {
      const videoList = await getUserVideos({ summary: true });
      if (!mounted.current) return;
      primeVideoSummaries(videoList);
      setVideos(videoList.filter((v) => v.uploadStatus !== UPLOAD_STATUS.FAILED));
    } catch (err: unknown) {
      if (!mounted.current) return;
      setError(errMsg(err, 'Failed to fetch videos'));
    } finally {
      if (mounted.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchVideos();
  }, [fetchVideos]);

  // Refetch when the tab gets focus so status is always live.
  useEffect(() => {
    const onFocus = () => void fetchVideos();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchVideos]);

  useEffect(() => {
    if (!videos.some((v) => IN_PROGRESS.includes(v.analysisStatus))) return;
    const interval = setInterval(() => void fetchVideos(), 5000);
    return () => clearInterval(interval);
  }, [videos, fetchVideos]);

  const visible = useMemo(() => videos.filter((v) => !hiddenIds.includes(v._id)), [videos, hiddenIds]);
  const parsed = useMemo(() => parseVideoQuery(query), [query]);

  const counts = useMemo(() => {
    const c: Record<StatusTab, number> = { all: 0, ready: 0, 'needs-views': 0, analyzing: 0, failed: 0 };
    for (const v of visible) for (const t of STATUS_TABS) if (inTab(v, t.id)) c[t.id] += 1;
    return c;
  }, [visible]);

  const filtered = useMemo(
    () => visible.filter((v) => inTab(v, tab) && matchesVideoQuery(v, parsed) && (filterFeature === 'all' || (v.selectedFeatures || []).includes(filterFeature))),
    [visible, tab, parsed, filterFeature]
  );

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const by: Record<SortKey, (a: Video, b: Video) => number> = {
      date: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      name: (a, b) => videoName(a).localeCompare(videoName(b)),
      score: (a, b) => (a.viralityScore ?? -1) - (b.viralityScore ?? -1),
      status: (a, b) => videoState(a).localeCompare(videoState(b)),
      length: (a, b) => (a.duration ?? 0) - (b.duration ?? 0),
    };
    return [...filtered].sort((a, b) => by[sortKey](a, b) * dir);
  }, [filtered, sortKey, sortDir]);

  useEffect(() => setLimit(PAGE_SIZE), [query, tab, filterFeature, sortKey, sortDir]);
  // Drop selections that are no longer on screen.
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(sorted.map((v) => v._id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [sorted]);

  const shown = sorted.slice(0, limit);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  /** Hides the videos at once and only calls the API once the undo window closes. */
  const handleDelete = useCallback(
    (ids: string[]) => {
      setHiddenIds((prev) => [...prev, ...ids]);
      setSelected(new Set());
      toast.show({
        message: ids.length === 1 ? 'Video deleted' : `${ids.length} videos deleted`,
        actionLabel: 'Undo',
        onAction: () => setHiddenIds((prev) => prev.filter((id) => !ids.includes(id))),
        onExpire: async () => {
          const failed: string[] = [];
          for (const id of ids) {
            try {
              await deleteVideo(id);
              removeVideoSummary(id);
            } catch (err: unknown) {
              failed.push(id);
              if (failed.length === 1) ErrorNotification(errMsg(err, 'Failed to delete video'));
            }
          }
          if (mounted.current) {
            setVideos((prev) => prev.filter((v) => !ids.includes(v._id) || failed.includes(v._id)));
            setHiddenIds((prev) => prev.filter((id) => !ids.includes(id)));
          }
          void refreshPendingCount();
        },
      });
    },
    [toast, refreshPendingCount]
  );

  const handleReanalyze = useCallback(
    async (ids: string[]) => {
      let ok = 0;
      for (const id of ids) {
        setReanalyzingVideoId(id);
        try {
          await reanalyzeVideo(id);
          ok += 1;
        } catch (err: unknown) {
          ErrorNotification(errMsg(err, 'Re-analyze failed'));
          break;
        }
      }
      setReanalyzingVideoId(null);
      setSelected(new Set());
      if (ok > 0) SuccessNotification(ok === 1 ? 'Re-analysis queued' : `${ok} re-analyses queued`);
      await fetchVideos();
      void refreshPendingCount();
    },
    [fetchVideos, refreshPendingCount]
  );

  const openVideo = useCallback(
    (videoId: string) => {
      const video = videos.find((v) => v._id === videoId);
      if (video?.analysisStatus !== ANALYSIS_STATUS.COMPLETED) {
        ErrorNotification('This video is still being analyzed. It usually takes 2 to 5 minutes.');
        return;
      }
      navigate(`/videos/${videoId}`);
    },
    [navigate, videos]
  );

  const onRenamed = (id: string, title: string | null) => setVideos((prev) => prev.map((v) => (v._id === id ? { ...v, title } : v)));

  const averageScore = useMemo<number | null>(() => {
    const scored = visible.filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED && typeof v.viralityScore === 'number' && !isNaN(v.viralityScore));
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((acc, v) => acc + (v.viralityScore as number), 0) / scored.length);
  }, [visible]);

  const hasFilters = parsed.tokens.length > 0 || Boolean(parsed.text) || filterFeature !== 'all' || tab !== 'all';
  const clearFilters = () => {
    setQuery('');
    setFilterFeature('all');
    setTab('all');
  };
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allShownSelected = shown.length > 0 && shown.every((v) => selected.has(v._id));
  const selectedIds = [...selected];
  const selectedReady = selectedIds.filter((id) => {
    const v = videos.find((x) => x._id === id);
    return v && !IN_PROGRESS.includes(v.analysisStatus);
  });

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="app-title">
              Library <span className="tabular font-normal text-fg-subtle">({visible.length})</span>
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-fg-muted">
              {averageScore != null ? <span className="tabular">Average score {averageScore} across your ready videos</span> : 'Every video you have analyzed.'}
              {averageScore != null && <InfoTip term="viralityScore" label="the virality score" />}
            </p>
          </div>
          {visible.length > 0 && (
            <div className="flex items-center gap-2">
              <IconButton
                aria-label="Refresh"
                title="Refresh"
                onClick={() => {
                  setRefreshing(true);
                  void fetchVideos();
                }}
              >
                <RefreshCw className={cn('h-4 w-4', refreshing && 'motion-safe:animate-spin')} aria-hidden="true" />
              </IconButton>
              <div role="group" aria-label="View" className="inline-flex rounded-lg border border-line p-0.5">
                {(
                  [
                    ['grid', LayoutGrid, 'Grid view'],
                    ['list', List, 'List view'],
                  ] as const
                ).map(([id, Icon, name]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={prefs.view === id}
                    aria-label={name}
                    title={name}
                    onClick={() => {
                      savePrefs({ ...prefs, view: id });
                      track('library_view_changed', { view: id });
                    }}
                    className={cn('app-focus inline-flex h-8 w-9 items-center justify-center rounded-md', prefs.view === id ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:text-fg')}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {isLoading ? (
          <div aria-busy="true" aria-label="Loading videos">
            <div className="mb-4 flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
            <Skeleton className="mb-6 h-11 w-full" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-line bg-surface p-3">
                  <Skeleton className="h-[136px] w-[76px]" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error && videos.length === 0 ? (
          <div role="alert" className="rounded-xl border border-danger/40 bg-surface p-6">
            <p className="text-base font-medium text-fg">We couldn't load your videos.</p>
            <p className="mt-1 text-sm text-fg-muted">{error}</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setIsLoading(true);
                void fetchVideos();
              }}
            >
              Try again
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Library className="h-10 w-10" aria-hidden="true" />}
            title="No videos yet"
            body="Analyze your first video to get its score and exactly what to fix."
            action={
              <ButtonLink to="/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New analysis
              </ButtonLink>
            }
          />
        ) : (
          <>
            {/* Status pills with counts, Stripe style. */}
            <div role="tablist" aria-label="Status" className="scrollbar-hide -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
              {STATUS_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'app-focus inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm',
                    tab === t.id ? 'border-accent/50 bg-accent-tint text-fg' : 'border-line text-fg-muted hover:text-fg'
                  )}
                >
                  {t.label}
                  <span className="tabular text-xs text-fg-subtle">{counts[t.id]}</span>
                </button>
              ))}
            </div>

            <div role="search" className="mb-3 flex flex-wrap items-center gap-3">
              <div className="relative basis-full sm:min-w-[220px] sm:flex-1 sm:basis-0">
                <label htmlFor="library-search" className="sr-only">
                  Search videos
                </label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
                <input
                  id="library-search"
                  type="search"
                  placeholder="Search, or filter: score:<40 platform:tiktok"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  className="app-focus h-11 w-full rounded-lg border border-control bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle"
                  autoComplete="off"
                />
                {searchFocused && !query && (
                  <div className="app-glass absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-line p-1 shadow-xl shadow-black/50">
                    <p className="app-label px-3 pb-1 pt-2">Filters</p>
                    {QUERY_HINTS.map((h) => (
                      <button
                        key={h.token}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setQuery(`${h.token} `)}
                        className="app-focus flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-fg hover:bg-white/5"
                      >
                        {h.label}
                        <code className="font-mono text-xs text-fg-muted">{h.token}</code>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Select
                id="library-sort"
                label="Sort"
                value={`${sortKey}:${sortDir}`}
                onChange={(v) => {
                  const [k, d] = v.split(':') as [SortKey, SortDir];
                  setSortKey(k);
                  setSortDir(d);
                }}
                options={[
                  { value: 'date:desc', label: 'Newest' },
                  { value: 'date:asc', label: 'Oldest' },
                  { value: 'score:desc', label: 'Top score' },
                  { value: 'score:asc', label: 'Lowest score' },
                  { value: 'name:asc', label: 'Name' },
                  { value: 'length:desc', label: 'Longest' },
                ]}
              />
              <Select
                id="library-feature"
                label="Check"
                value={filterFeature}
                onChange={setFilterFeature}
                options={[{ value: 'all', label: 'All checks' }, ...ANALYSIS_FEATURES_UI.map((f) => ({ value: f.id, label: f.label }))]}
              />
            </div>

            {/* What is applied, as removable chips. */}
            {hasFilters && (
              <div className="mb-3 flex flex-wrap items-center gap-2" aria-label="Filters in use">
                {tab !== 'all' && (
                  <Chip onRemove={() => setTab('all')}>{STATUS_TABS.find((t) => t.id === tab)?.label}</Chip>
                )}
                {parsed.tokens.map((t) => (
                  <Chip key={t.raw} onRemove={() => setQuery(removeQueryToken(query, t.raw))}>
                    {t.label}
                  </Chip>
                ))}
                {parsed.text && <Chip onRemove={() => setQuery(parsed.tokens.map((t) => t.raw).join(' '))}>“{parsed.text}”</Chip>}
                {filterFeature !== 'all' && <Chip onRemove={() => setFilterFeature('all')}>{featureLabel(filterFeature)}</Chip>}
                <button type="button" onClick={clearFilters} className="app-focus rounded text-xs font-medium text-fg-muted hover:text-fg">
                  Clear all
                </button>
              </div>
            )}

            <div className="mb-3 flex min-h-9 flex-wrap items-center justify-between gap-3">
              <p className="tabular text-sm text-fg-muted" role="status">
                {sorted.length === 0 ? 'No videos match' : `${Math.min(shown.length, sorted.length) === sorted.length ? `${sorted.length}` : `1–${shown.length} of ${sorted.length}`} ${sorted.length === 1 ? 'video' : 'videos'}`}
              </p>
              <div className="flex items-center gap-2">
                {selected.size > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/40 bg-accent-tint px-2 py-1" role="region" aria-label="Selected videos">
                    <span className="tabular px-1 text-sm text-fg">{selected.size} selected</span>
                    <Button size="sm" variant="ghost" disabled={selectedReady.length === 0 || reanalyzingVideoId !== null} onClick={() => void handleReanalyze(selectedReady)}>
                      {reanalyzingVideoId ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                      Re-analyze
                    </Button>
                    <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10 hover:text-danger" onClick={() => handleDelete(selectedIds)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                    <IconButton aria-label="Clear selection" onClick={() => setSelected(new Set())} className="h-8 w-8">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                  </div>
                ) : (
                  shown.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelected(new Set(shown.map((v) => v._id)))}
                      className="app-focus rounded text-sm text-fg-muted hover:text-fg"
                    >
                      Select all
                    </button>
                  )
                )}
                {prefs.view === 'list' && (
                  <Popover
                    side="bottom-end"
                    label="Choose columns"
                    buttonClassName="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-white/5 hover:text-fg"
                    panelClassName="w-48"
                    trigger={() => <Columns3 className="h-4 w-4" aria-hidden="true" />}
                  >
                    {() => (
                      <fieldset className="p-2">
                        <legend className="app-label px-1 pb-1">Columns</legend>
                        {COLUMNS.map((c) => (
                          <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm text-fg hover:bg-white/5">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-[#E86735]"
                              checked={prefs.columns.includes(c.id)}
                              onChange={(e) =>
                                savePrefs({ ...prefs, columns: e.target.checked ? COLUMNS.map((x) => x.id).filter((id) => id === c.id || prefs.columns.includes(id)) : prefs.columns.filter((x) => x !== c.id) })
                              }
                            />
                            {c.label}
                          </label>
                        ))}
                      </fieldset>
                    )}
                  </Popover>
                )}
              </div>
            </div>

            {sorted.length === 0 ? (
              <EmptyState
                icon={<Search className="h-9 w-9" aria-hidden="true" />}
                title="No videos match"
                body="Try a different search, or remove a filter."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : prefs.view === 'grid' ? (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shown.map((video) => (
                  <li key={video._id}>
                    <VideoCard
                      video={video}
                      onDelete={(id) => handleDelete([id])}
                      onReanalyze={(id) => handleReanalyze([id])}
                      onChatClick={openVideo}
                      reanalyzingVideoId={reanalyzingVideoId}
                      selected={selected.has(video._id)}
                      onToggleSelect={toggleSelect}
                      onRenamed={onRenamed}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                <table className="w-full min-w-[680px] table-fixed text-left text-sm">
                  <thead className="border-b border-line text-xs text-fg-muted">
                    <tr>
                      <th scope="col" className="w-10 py-2 pl-3">
                        <input
                          type="checkbox"
                          aria-label={allShownSelected ? 'Select none' : 'Select all shown'}
                          checked={allShownSelected}
                          onChange={() => setSelected(allShownSelected ? new Set() : new Set(shown.map((v) => v._id)))}
                          className="h-4 w-4 accent-[#E86735]"
                        />
                      </th>
                      <SortHeader label="Name" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="w-[40%]" />
                      {prefs.columns.includes('score') && <SortHeader label="Score" k="score" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />}
                      {prefs.columns.includes('status') && <SortHeader label="Status" k="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />}
                      {prefs.columns.includes('date') && <SortHeader label="Date" k="date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />}
                      {prefs.columns.includes('length') && <SortHeader label="Length" k="length" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />}
                      {prefs.columns.includes('platform') && (
                        <th scope="col" className="px-3 py-2 font-medium">
                          Platform
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((v) => {
                      const state = videoState(v);
                      const name = videoName(v);
                      return (
                        <tr key={v._id} className={cn('border-b border-line last:border-0 hover:bg-white/[0.02]', selected.has(v._id) && 'bg-accent-tint')}>
                          <td className="py-2 pl-3">
                            <input type="checkbox" aria-label={`Select ${name}`} checked={selected.has(v._id)} onChange={() => toggleSelect(v._id)} className="h-4 w-4 accent-[#E86735]" />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex min-w-0 items-center gap-3">
                              <VideoThumb video={v} className="h-12 w-9 shrink-0 rounded-md" iconClassName="h-4 w-4" />
                              {renamingId === v._id ? (
                                <InlineRename
                                  videoId={v._id}
                                  initial={v.title ?? name}
                                  className="flex-1"
                                  onDone={(saved) => {
                                    setRenamingId(null);
                                    if (saved !== undefined) onRenamed(v._id, saved);
                                  }}
                                />
                              ) : (
                                <span className="group/name flex min-w-0 flex-1 items-center gap-1">
                                  {state === 'ready' || state === 'needs-views' ? (
                                    <Link to={`/videos/${v._id}`} className="app-focus truncate rounded font-medium text-fg hover:underline" title={name}>
                                      {name}
                                    </Link>
                                  ) : (
                                    <span className="truncate font-medium text-fg" title={name}>
                                      {name}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setRenamingId(v._id)}
                                    className="app-focus shrink-0 rounded px-1 text-xs text-fg-subtle opacity-0 hover:text-fg focus:opacity-100 group-hover/name:opacity-100"
                                  >
                                    Rename<span className="sr-only"> {name}</span>
                                  </button>
                                </span>
                              )}
                            </div>
                          </td>
                          {prefs.columns.includes('score') && (
                            <td className="whitespace-nowrap px-3 py-2">{typeof v.viralityScore === 'number' && state !== 'analyzing' && state !== 'failed' ? <ScoreBadge score={v.viralityScore} /> : <span className="text-fg-subtle">–</span>}</td>
                          )}
                          {prefs.columns.includes('status') && (
                            <td className="whitespace-nowrap px-3 py-2">
                              {state === 'needs-views' ? (
                                <Link to={`/analytics?tab=videos&log=${v._id}`} className="app-focus inline-flex items-center rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning hover:bg-warning/20">
                                  Needs views
                                </Link>
                              ) : (
                                <StatusPill kind={statusKind(v.analysisStatus, v.uploadStatus)} />
                              )}
                            </td>
                          )}
                          {prefs.columns.includes('date') && <td className="tabular whitespace-nowrap px-3 py-2 text-fg-muted">{formatVideoDate(v.createdAt)}</td>}
                          {prefs.columns.includes('length') && <td className="tabular whitespace-nowrap px-3 py-2 text-fg-muted">{formatDuration(v.duration) || '–'}</td>}
                          {prefs.columns.includes('platform') && (
                            <td className="whitespace-nowrap px-3 py-2 text-fg-muted">{v.creatorPlatform ? (PLATFORM_LABELS[v.creatorPlatform] ?? v.creatorPlatform) : '–'}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {sorted.length > shown.length && (
              <div className="mt-6 flex justify-center">
                <Button variant="secondary" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                  Show {Math.min(PAGE_SIZE, sorted.length - shown.length)} more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </UserPage>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent-tint py-1 pl-3 pr-1 text-xs font-medium text-fg">
      {children}
      <button type="button" onClick={onRemove} aria-label="Remove filter" className="app-focus inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/10">
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

function SortHeader({ label, k, sortKey, sortDir, onSort, className }: { label: string; k: SortKey; sortKey: SortKey; sortDir: SortDir; onSort: (k: SortKey) => void; className?: string }) {
  const active = sortKey === k;
  return (
    <th scope="col" className={cn('px-3 py-2 font-medium', className)} aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => onSort(k)} className={cn('app-focus inline-flex items-center gap-1 rounded hover:text-fg', active && 'text-fg')}>
        {label}
        {active && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />)}
      </button>
    </th>
  );
}

export default Videos;
