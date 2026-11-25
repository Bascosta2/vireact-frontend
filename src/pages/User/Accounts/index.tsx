import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ExternalLink, Film, Link2, RefreshCw, Unlink } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/app/Button';
import { Select } from '@/components/app/Select';
import { Skeleton } from '@/components/app/Skeleton';
import { EmptyState } from '@/components/app/EmptyState';
import { useToast } from '@/components/app/Toast';
import { formatCompact, formatShortDate } from '@/components/charts/chart-theme';
import { apiErrorCode, apiErrorMessage } from '@/api/analytics';
import {
  disconnectAccount, getAccounts, returnErrorMessage, getConnectedPosts, linkPost, startConnect, syncAccount,
  type AccountPlatform, type AccountsOverview, type ConnectedAccount, type ConnectedPost,
} from '@/api/accounts';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const PLATFORM_COPY: Record<AccountPlatform, { what: string }> = {
  tiktok: { what: 'Views, likes, comments and shares of your TikToks.' },
  youtube: { what: 'Shorts views, likes, comments, average watch time and where viewers drop off.' },
  instagram: { what: 'Reels views, reach, saves, shares and average watch time. Needs a professional (Creator or Business) account.' },
  facebook: { what: 'Views, reach, average watch time and where viewers drop off for the videos and Reels on your Facebook Pages. You choose which Pages to share.' },
};

const ago = (iso: string | null) => {
  if (!iso) return 'never';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return formatShortDate(iso);
};

const PLATFORM_NAMES: Record<AccountPlatform, string> = { tiktok: 'TikTok', youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook' };

/** Facebook accounts are named after their Pages, so no "@" in front. */
const accountLabel = (a: ConnectedAccount) => {
  if (!a.handle) return PLATFORM_NAMES[a.platform];
  return `${PLATFORM_NAMES[a.platform]} ${a.platform === 'facebook' ? a.handle : `@${a.handle.replace(/^@/, '')}`}`;
};

const watch = (r: ConnectedPost['latest']) => {
  if (!r) return '–';
  if (r.avgWatchSec != null && r.avgViewPct != null) return `${r.avgWatchSec}s (${Math.round(r.avgViewPct)}%)`;
  if (r.avgWatchSec != null) return `${r.avgWatchSec}s`;
  return '–';
};

function PlatformCard({
  platform, name, configured, account, busy, onConnect, onSync, onDisconnect,
}: {
  platform: AccountPlatform;
  name: string;
  configured: boolean;
  account: ConnectedAccount | undefined;
  busy: boolean;
  onConnect: () => void;
  onSync: (a: ConnectedAccount) => void;
  onDisconnect: (a: ConnectedAccount) => void;
}) {
  const needsReauth = account?.status === 'needs_reauth';
  return (
    <section className="flex flex-col rounded-xl border border-line bg-surface p-5" aria-label={name}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-fg">{name}</h2>
          <p className="mt-1 text-sm text-fg-muted">{PLATFORM_COPY[platform].what}</p>
        </div>
        {account && (
          <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium', needsReauth ? 'border-warning/40 text-warning' : 'border-success/40 text-success')}>
            {needsReauth ? 'Reconnect' : 'Connected'}
          </span>
        )}
      </div>
      {account ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            {account.avatarUrl ? (
              <img src={account.avatarUrl} alt="" className="h-10 w-10 rounded-full bg-canvas object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-sm font-semibold text-fg-muted" aria-hidden="true">
                {(account.handle || account.displayName || name).slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{account.handle ? (platform === 'facebook' ? account.handle : `@${account.handle.replace(/^@/, '')}`) : account.displayName || name}</p>
              <p className="tabular text-xs text-fg-muted">
                {account.followers != null ? `${formatCompact(account.followers)} followers · ` : ''}
                {account.posts} posts · {account.linked} linked
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-fg-subtle">Updated {ago(account.lastSyncAt)}. Numbers refresh every night.</p>
          {needsReauth && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {name} stopped accepting the connection. Connect again to keep your numbers updating.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {needsReauth ? (
              <Button size="sm" onClick={onConnect} disabled={busy}>Connect again</Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onSync(account)} disabled={busy}>
                <RefreshCw className={cn('h-4 w-4', busy && 'animate-spin')} aria-hidden="true" />
                Refresh now
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onDisconnect(account)} disabled={busy}>
              <Unlink className="h-4 w-4" aria-hidden="true" />
              Disconnect
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-auto pt-5">
          {configured ? (
            <Button size="sm" onClick={onConnect} disabled={busy}>
              <Link2 className="h-4 w-4" aria-hidden="true" />
              Connect {name}
            </Button>
          ) : (
            <span className="inline-flex rounded-full border border-line px-2.5 py-1 text-xs text-fg-subtle">Coming soon</span>
          )}
        </div>
      )}
    </section>
  );
}

function PostRow({ post, onLink }: { post: ConnectedPost; onLink: (post: ConnectedPost, videoId: string | null) => void }) {
  const options = useMemo(() => {
    const base = [{ value: '', label: post.candidates.length ? 'Pick the matching upload…' : 'No matching upload' }];
    if (post.videoId) return [{ value: post.videoId, label: post.videoTitle || 'Linked upload' }, { value: '', label: 'Unlink' }];
    return [...base, ...post.candidates.map((c) => ({ value: c.videoId, label: `${c.title}${c.durationSec != null ? ` · ${Math.round(c.durationSec)}s` : ''}` }))];
  }, [post]);
  const r = post.latest;
  return (
    <tr className="border-t border-line align-middle">
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          {post.thumbnailUrl ? (
            <img src={post.thumbnailUrl} alt="" loading="lazy" className="h-14 w-10 shrink-0 rounded-md bg-canvas object-cover" />
          ) : (
            <span className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-canvas text-fg-subtle"><Film className="h-4 w-4" aria-hidden="true" /></span>
          )}
          <div className="min-w-0">
            <p className="line-clamp-2 max-w-[28ch] text-sm text-fg">{post.caption || 'Untitled post'}</p>
            <p className="text-xs text-fg-subtle">
              {formatShortDate(post.postedAt)}
              {post.url && (
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="app-focus ml-2 inline-flex items-center gap-0.5 text-fg-muted hover:text-fg">
                  Open <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </p>
          </div>
        </div>
      </td>
      <td className="tabular py-3 pr-3 text-right text-sm text-fg">{formatCompact(r?.views)}</td>
      <td className="tabular hidden py-3 pr-3 text-right text-sm text-fg-muted sm:table-cell">{formatCompact(r?.likes)}</td>
      <td className="tabular hidden py-3 pr-3 text-right text-sm text-fg-muted md:table-cell">{formatCompact(r?.comments)}</td>
      <td className="tabular hidden py-3 pr-3 text-right text-sm text-fg-muted md:table-cell">{formatCompact(r?.shares)}</td>
      <td className="tabular hidden py-3 pr-3 text-right text-sm text-fg-muted lg:table-cell">{watch(r)}</td>
      <td className="py-3">
        {post.videoId ? (
          <div className="flex items-center gap-2">
            <Link to={`/videos/${post.videoId}`} className="app-focus line-clamp-1 max-w-[18ch] text-sm text-accent hover:underline">{post.videoTitle || 'Your upload'}</Link>
            <button type="button" className="app-focus text-xs text-fg-subtle hover:text-fg" onClick={() => onLink(post, null)}>Unlink</button>
          </div>
        ) : post.candidates.length ? (
          <Select id={`link-${post.id}`} label="Matching upload" value="" options={options} onChange={(v) => v && onLink(post, v)} className="min-w-[12rem]" />
        ) : (
          <span className="text-xs text-fg-subtle">Not analysed in Vireact</span>
        )}
      </td>
    </tr>
  );
}

interface DisconnectDialogProps {
  account: ConnectedAccount | null;
  onCancel: () => void;
  onConfirm: (deleteData: boolean) => void;
}

/** Disconnect confirmation with the optional "delete the numbers this account added to my videos" choice. */
function DisconnectDialog({ account, onCancel, onConfirm }: DisconnectDialogProps) {
  const [deleteData, setDeleteData] = useState(false);

  useEffect(() => {
    setDeleteData(false);
    if (!account) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [account, onCancel]);

  const toggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setDeleteData(e.target.checked), []);
  const confirm = useCallback(() => onConfirm(deleteData), [onConfirm, deleteData]);

  if (!account) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="disconnect-title" aria-describedby="disconnect-desc" className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
        <h2 id="disconnect-title" className="text-lg font-semibold">Disconnect this account?</h2>
        <p id="disconnect-desc" className="mt-2 text-sm text-text-secondary">
          Vireact stops syncing it, and its posts and sign-in access are removed from this tab. Results already saved on your videos stay unless you tick the box below.
        </p>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5" checked={deleteData} onChange={toggle} />
          <span>
            Also delete the numbers this account added to my videos
            <span className="mt-1 block text-xs text-text-secondary">Your uploads, analyses and anything you typed stay.</span>
          </span>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={confirm}>Disconnect</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Accounts: connect TikTok, YouTube, Instagram and Facebook so each post's real numbers arrive every night. A post
 * linked to its Vireact upload (automatically when the match is clear) feeds that video's report and the
 * view predictions with verified results.
 */
export default function Accounts() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const [overview, setOverview] = useState<AccountsOverview | null>(null);
  const [posts, setPosts] = useState<ConnectedPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [toDisconnect, setToDisconnect] = useState<ConnectedAccount | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const id = ++loadId.current;
    try {
      const [o, p] = await Promise.all([getAccounts(), getConnectedPosts()]);
      if (id !== loadId.current) return;
      setOverview(o);
      setPosts(p);
      setError(null);
    } catch (err) {
      if (id === loadId.current) setError(apiErrorMessage(err, 'Could not load your accounts. Try again.'));
    }
  }, []);

  useEffect(() => {
    track('accounts_viewed', {});
    void load();
  }, [load]);

  // Back from a platform's sign-in: say how it went, then clean the URL.
  useEffect(() => {
    const connected = params.get('connected');
    const err = params.get('error');
    if (!connected && !err) return;
    if (connected) {
      toast.show({ message: 'Connected. Your posts are loading; this can take a minute.' });
      track('account_connected', { platform: connected });
      // The first sync runs in the background: look again shortly.
      const t = setTimeout(() => void load(), 8000);
      setParams({}, { replace: true });
      return () => clearTimeout(t);
    }
    setReturnError(returnErrorMessage(err));
    setParams({}, { replace: true });
    return undefined;
  }, [params, setParams, toast, load]);

  const connect = async (platform: AccountPlatform) => {
    setBusy(platform);
    try {
      window.location.assign(await startConnect(platform));
    } catch (err) {
      toast.show({ message: apiErrorMessage(err, 'Could not start the sign-in. Try again.') });
      setBusy(null);
    }
  };

  const sync = async (a: ConnectedAccount) => {
    setBusy(a.platform);
    try {
      await syncAccount(a.id);
      await load();
      toast.show({ message: 'Numbers refreshed.' });
    } catch (err) {
      if (apiErrorCode(err) === 'NEEDS_REAUTH') await load();
      toast.show({ message: apiErrorMessage(err, 'Could not refresh right now. Try again later.') });
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (a: ConnectedAccount, deleteData: boolean) => {
    setToDisconnect(null);
    setBusy(a.platform);
    try {
      await disconnectAccount(a.id, deleteData);
      await load();
    } catch (err) {
      toast.show({ message: apiErrorMessage(err, 'Could not disconnect. Try again.') });
    } finally {
      setBusy(null);
    }
  };

  const closeDisconnect = useCallback(() => setToDisconnect(null), []);
  const confirmDisconnect = useCallback((deleteData: boolean) => {
    if (toDisconnect) void disconnect(toDisconnect, deleteData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toDisconnect]);

  const onLink = async (post: ConnectedPost, videoId: string | null) => {
    try {
      await linkPost(post.id, videoId);
      track(videoId ? 'account_post_linked' : 'account_post_unlinked', { platform: post.platform });
      await load();
    } catch (err) {
      toast.show({ message: apiErrorMessage(err, 'Could not save that link. Try again.') });
    }
  };

  const connected = overview?.accounts ?? [];
  const filterOptions = [{ value: 'all', label: 'All accounts' }, ...connected.map((a) => ({ value: a.id, label: accountLabel(a) }))];
  const visible = (posts ?? []).filter((p) => filter === 'all' || p.accountId === filter);

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Accounts"
          subtitle="Connect your accounts and your posts' real numbers arrive every night. Linked to their Vireact uploads, they make your reports and view predictions more accurate."
        />
        {returnError && <p className="mb-6 rounded-lg border border-danger/40 px-4 py-3 text-sm text-danger" role="alert">{returnError}</p>}
        {error && <p className="mb-6 rounded-lg border border-danger/40 px-4 py-3 text-sm text-danger" role="alert">{error}</p>}

        <div className="grid gap-4 md:grid-cols-3">
          {overview
            ? overview.platforms.map((p) => (
              <PlatformCard
                key={p.id}
                platform={p.id}
                name={p.name}
                configured={p.configured}
                account={connected.find((a) => a.platform === p.id)}
                busy={busy === p.id}
                onConnect={() => void connect(p.id)}
                onSync={(a) => void sync(a)}
                onDisconnect={setToDisconnect}
              />
            ))
            : [0, 1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>

        <section className="mt-10" aria-labelledby="posts-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="posts-heading" className="text-lg font-semibold text-fg">Your posts</h2>
              <p className="mt-1 text-sm text-fg-muted">Link a post to the upload you analysed so its results land on that video's report.</p>
            </div>
            {connected.length > 1 && <Select id="accounts-filter" label="Account" value={filter} options={filterOptions} onChange={setFilter} />}
          </div>
          {posts === null ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : !connected.length ? (
            <EmptyState icon={<Link2 className="h-8 w-8" aria-hidden="true" />} title="No accounts connected yet" body="Connect an account above. Your recent posts and their numbers show up here." />
          ) : !visible.length ? (
            <EmptyState icon={<Film className="h-8 w-8" aria-hidden="true" />} title="No posts yet" body="We could not find posts on this account yet. New posts appear after the next nightly refresh." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line bg-surface px-4">
              <table className="w-full min-w-[34rem]">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-fg-subtle">
                    <th className="py-3 pr-3 font-medium">Post</th>
                    <th className="py-3 pr-3 text-right font-medium">Views</th>
                    <th className="hidden py-3 pr-3 text-right font-medium sm:table-cell">Likes</th>
                    <th className="hidden py-3 pr-3 text-right font-medium md:table-cell">Comments</th>
                    <th className="hidden py-3 pr-3 text-right font-medium md:table-cell">Shares</th>
                    <th className="hidden py-3 pr-3 text-right font-medium lg:table-cell">Avg watch</th>
                    <th className="py-3 font-medium">Vireact upload</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => <PostRow key={p.id} post={p} onLink={(post, v) => void onLink(post, v)} />)}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    <DisconnectDialog account={toDisconnect} onCancel={closeDisconnect} onConfirm={confirmDisconnect} />
    </UserPage>
  );
}
