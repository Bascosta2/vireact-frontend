import Axios from './index';

/** Accounts tab: connected TikTok / YouTube / Instagram / Facebook accounts (backend /accounts). */

export type AccountPlatform = 'tiktok' | 'youtube' | 'instagram' | 'facebook';

export interface PlatformStatus {
  id: AccountPlatform;
  name: string;
  /** The platform's keys are set up on the server, so it can be connected. */
  configured: boolean;
}

export interface ConnectedAccount {
  id: string;
  platform: AccountPlatform;
  handle: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followers: number | null;
  status: 'active' | 'needs_reauth';
  connectedAt: string;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  posts: number;
  linked: number;
}

export interface AccountsOverview {
  available: boolean;
  platforms: PlatformStatus[];
  accounts: ConnectedAccount[];
}

export interface PostReading {
  at: string;
  ageHours: number | null;
  views: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  reach?: number | null;
  avgWatchSec?: number | null;
  avgViewPct?: number | null;
}

export interface MatchCandidate {
  videoId: string;
  title: string;
  durationSec: number | null;
  createdAt: string;
  gapSec: number | null;
}

export interface ConnectedPost {
  id: string;
  accountId: string;
  platform: AccountPlatform;
  url: string | null;
  caption: string | null;
  postedAt: string | null;
  durationSec: number | null;
  thumbnailUrl: string | null;
  mediaType: string | null;
  latest: PostReading | null;
  readings: { at: string; ageHours: number | null; views: number | null }[];
  retention: number[] | null;
  videoId: string | null;
  videoTitle: string | null;
  linkSource: 'auto' | 'user' | null;
  candidates: MatchCandidate[];
}

export const getAccounts = async (): Promise<AccountsOverview> => (await Axios.get<{ data: AccountsOverview }>('/accounts')).data.data;

/** Returns the platform's sign-in page; the browser goes there and comes back to /accounts. */
export const startConnect = async (platform: AccountPlatform): Promise<string> =>
  (await Axios.post<{ data: { url: string } }>(`/accounts/${platform}/connect`)).data.data.url;

export const syncAccount = async (id: string): Promise<ConnectedAccount> => (await Axios.post<{ data: ConnectedAccount }>(`/accounts/${id}/sync`)).data.data;

export const disconnectAccount = async (id: string): Promise<void> => {
  await Axios.delete(`/accounts/${id}`);
};

export const getConnectedPosts = async (accountId?: string): Promise<ConnectedPost[]> =>
  (await Axios.get<{ data: { posts: ConnectedPost[] } }>('/accounts/posts', { params: accountId ? { accountId } : {} })).data.data.posts;

export const linkPost = async (postId: string, videoId: string | null): Promise<ConnectedPost> =>
  (await Axios.put<{ data: ConnectedPost }>(`/accounts/posts/${postId}/link`, { videoId })).data.data;
