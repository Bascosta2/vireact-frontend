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

export interface CreatePostInput {
  projectId?: string;
  mediaUrl?: string;
  caption: string;
  platforms: PublishPlatform[];
  scheduledAt: string;
  mode: PostMode;
}

export interface UpdatePostInput {
  caption?: string;
  scheduledAt?: string;
  platforms?: PublishPlatform[];
}

export const getPostCapabilities = async (): Promise<PostCapabilities> =>
  (await Axios.get<{ data: PostCapabilities }>('/posts/capabilities')).data.data;

/** Posts scheduled between two instants (ISO strings, `to` exclusive). */
export const listScheduledPosts = async (from: string, to: string): Promise<ScheduledPost[]> =>
  (await Axios.get<{ data: { posts: ScheduledPost[] } }>('/posts', { params: { from, to } })).data.data.posts;

export const createScheduledPost = async (input: CreatePostInput): Promise<ScheduledPost> =>
  (await Axios.post<{ data: { post: ScheduledPost } }>('/posts', input)).data.data.post;

export const updateScheduledPost = async (id: string, input: UpdatePostInput): Promise<ScheduledPost> =>
  (await Axios.patch<{ data: { post: ScheduledPost } }>(`/posts/${id}`, input)).data.data.post;

/** Cancels the post; the server keeps it with status 'cancelled'. */
export const cancelScheduledPost = async (id: string): Promise<ScheduledPost> =>
  (await Axios.delete<{ data: { post: ScheduledPost } }>(`/posts/${id}`)).data.data.post;
