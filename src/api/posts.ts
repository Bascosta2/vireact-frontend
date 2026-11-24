import Axios from './index';

/**
 * Scheduled posts (backend /posts): publish an exported edit to connected TikTok / Instagram / YouTube /
 * Facebook accounts at a set time, or send it to the platform as a draft. Behind VITE_PUBLISHING and the
 * backend's own switch (capabilities.enabled); see src/lib/publishing-access.ts.
 */

export type PublishPlatform = 'tiktok' | 'instagram' | 'youtube' | 'facebook';

export type PostStatus = 'scheduled' | 'publishing' | 'published' | 'partially_published' | 'failed' | 'cancelled';

export type PostMode = 'draft' | 'publish';

export interface PlatformCapability {
  platform: PublishPlatform;
  connected: boolean;
  canPublish: boolean;
  /** Why this platform can't be used right now (a code or a short sentence from the server). */
  reason?: string;
}

export interface PostCapabilities {
  enabled: boolean;
  platforms: PlatformCapability[];
}

export interface PostTarget {
  platform: PublishPlatform;
  /** Per-platform progress, e.g. scheduled / publishing / published / failed. */
  status: string;
  externalId?: string;
  url?: string;
  error?: string;
  /** What the creator chose for a TikTok post (kept so it can be edited). */
  tiktok?: TikTokPostSettings;
}

export interface ScheduledPost {
  id: string;
  projectId?: string;
  mediaUrl: string;
  caption: string;
  scheduledAt: string;
  status: PostStatus;
  mode: PostMode;
  targets: PostTarget[];
  createdAt: string;
  updatedAt: string;
}

/** Fresh from TikTok each time it is needed (their guidelines require showing the creator's own account and limits). */
export interface TikTokCreatorInfo {
  nickname: string | null;
  avatarUrl?: string | null;
  /** Raw TikTok values, e.g. PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS, FOLLOWER_OF_CREATOR, SELF_ONLY. */
  privacyLevelOptions: string[];
  commentDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
  maxVideoPostDurationSec: number | null;
  canPost: boolean;
  reason?: string;
}

/** What the creator chose on the TikTok posting screen. */
export interface TikTokPostSettings {
  privacyLevel: string;
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  commercial: { enabled: boolean; yourBrand: boolean; brandedContent: boolean };
  /** Posting counts as agreeing to TikTok's Music Usage Confirmation (and Branded Content Policy when branded). */
  musicConfirmed: true;
}

export interface CreatePostInput {
  projectId?: string;
  mediaUrl?: string;
  caption: string;
  platforms: PublishPlatform[];
  scheduledAt: string;
  mode: PostMode;
  tiktok?: TikTokPostSettings;
}

export interface UpdatePostInput {
  caption?: string;
  scheduledAt?: string;
  platforms?: PublishPlatform[];
  tiktok?: TikTokPostSettings;
}

export const getPostCapabilities = async (): Promise<PostCapabilities> =>
  (await Axios.get<{ data: PostCapabilities }>('/posts/capabilities')).data.data;

/** Posts scheduled between two instants (ISO strings, `to` exclusive). */
export const listScheduledPosts = async (from: string, to: string): Promise<ScheduledPost[]> =>
  (await Axios.get<{ data: { posts: ScheduledPost[] } }>('/posts', { params: { from, to } })).data.data.posts;

/** Tolerates the usual { data } envelope or a bare object. */
export const getTikTokCreatorInfo = async (): Promise<TikTokCreatorInfo> => {
  const body = (await Axios.get<{ data?: TikTokCreatorInfo } & Partial<TikTokCreatorInfo>>('/posts/tiktok/creator-info')).data;
  return (body.data ?? body) as TikTokCreatorInfo;
};

export const createScheduledPost = async (input: CreatePostInput): Promise<ScheduledPost> =>
  (await Axios.post<{ data: { post: ScheduledPost } }>('/posts', input)).data.data.post;

export const updateScheduledPost = async (id: string, input: UpdatePostInput): Promise<ScheduledPost> =>
  (await Axios.patch<{ data: { post: ScheduledPost } }>(`/posts/${id}`, input)).data.data.post;

/** Cancels the post; the server keeps it with status 'cancelled'. */
export const cancelScheduledPost = async (id: string): Promise<ScheduledPost> =>
  (await Axios.delete<{ data: { post: ScheduledPost } }>(`/posts/${id}`)).data.data.post;
