import type { StyleId } from '@/remotion/styles/ids';
import Axios from './index';
import type { CaptionPreset, EditProps } from '@/remotion/types';
import type { Brand } from '@/remotion/brand';

export type EditStatus = 'awaiting_upload' | 'queued' | 'preprocessing' | 'planning' | 'ready' | 'failed';
export type ChangeKind = 'cut' | 'reorder' | 'captions' | 'zoom' | 'hook' | 'overlay' | 'graphics' | 'transition' | 'effects' | 'music' | 'sfx' | 'framing' | 'look';
export type Evidence = 'knowledge' | 'viral_example' | 'footage';

export interface EditorUsage {
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  resetsOn: string;
  canStart: boolean;
  locked: boolean;
  available: boolean;
  renderAvailable: boolean;
  maxUploadBytes: number;
  maxDurationSec: number;
}

export interface EditProjectSummary {
  id: string;
  title: string;
  /** Editing skill this edit follows (Skills tab), or null for the classic editor. */
  skill: string | null;
  status: EditStatus;
  stage: string;
  progress: number;
  error: string | null;
  durationSec: number | null;
  editedDurationSec: number | null;
  thumbnailUrl: string | null;
  createdAt: string;
  readyAt: string | null;
  hasRender: boolean;
}

export interface PlanChange {
  kind: ChangeKind;
  label: string;
  why: string;
  evidence: Evidence;
}

export interface EditPlanView {
  summary: string;
  hookStrategy: string;
  changes: PlanChange[];
  expectedEffect: string;
  segments: { id: string; start: number; end: number; role: string; reason: string }[];
  captions: { preset: CaptionPreset; emphasisWordIdx: number[] };
  hookOverlay: { enabled: boolean; text: string; durationSec: number };
  zooms: { index: number; at: number; scale: number; reason: string }[];
  music: { trackId: string | null; volume: number; reason: string };
  framing: { mode: 'fill' | 'fit_blur' | 'split'; focusX: number };
  /** Counts with every layer on (sounds include the automatic sound design). */
  sfxCount: number;
  overlayCount: number;
  transitionCount?: number;
  effectCount?: number;
  graphics?: { type: string; text: string }[];
  look?: { grade: string; accent: string; progressBar: boolean; motion: boolean };
}

/** One planned beat (a segment of the edit) with what plays in it. Storyboard review: EditorFeaturesV2 only. */
export interface StoryboardBeat {
  id: string;
  role: string;
  start: number;
  end: number;
  reason: string;
  dropped: boolean;
  swapped: boolean;
  swapNote: string | null;
  graphics: { type: string; text: string; start: number }[];
  sounds: { type: string; at: number }[];
  effects: { type: string; at: number }[];
  zooms: number;
  framing: 'fill' | 'fit_blur' | 'split';
}

export interface Storyboard {
  approved: boolean;
  beats: StoryboardBeat[];
}

export interface Edits {
  /** Storyboard review: the creator approved the beats as shown, and the beats they swapped (kept by the server). */
  storyboardApproved?: boolean;
  beatSwaps?: Record<string, unknown>;
  disabledSegments?: string[];
  restoredCandidates?: string[];
  disabledZooms?: number[];
  keepOriginalOrder?: boolean;
  captionsOff?: boolean;
  hookOverlayOff?: boolean;
  zoomsOff?: boolean;
  overlaysOff?: boolean;
  sfxOff?: boolean;
  transitionsOff?: boolean;
  effectsOff?: boolean;
  captionPreset?: CaptionPreset;
  hookText?: string;
  captionText?: Record<string, string>;
  musicTrackId?: string | null;
  musicVolume?: number;
  framingMode?: 'fill' | 'fit_blur' | 'split';
  /** Text hook style of the Remotion Reel skill. */
  hookVariant?: 'white' | 'black' | 'plain';
  /** Another animation style for an edit made with one (Style tab); the backend ignores it for other edits. */
  animationStyle?: StyleId;
}

export type PreviewProps = Omit<EditProps, 'videoUrl'>;

export interface RenderInfo {
  id: string;
  status: 'rendering' | 'done' | 'failed';
  progress: number;
  error: string | null;
  createdAt?: string;
  downloadUrl?: string | null;
}

export interface EditProjectDetail extends EditProjectSummary {
  source: { durationSec: number; width: number; height: number; hasAudio: boolean } | null;
  regenerationsLeft: number;
  billing: 'trial' | 'plan' | null;
  renders: RenderInfo[];
  linkedVideoId: string | null;
  plan: EditPlanView | null;
  edits: Edits;
  /** Present only while the editor extras are on. */
  storyboard?: Storyboard;
  props: PreviewProps | null;
  proxyUrl: string | null;
  candidates: { id: string; kind: string; start: number; end: number; text: string | null }[];
  words: { i: number; w: string; start: number }[];
  tracks?: { slug: string; title: string; mood: string | null; energy: number | null }[];
}

export const getEditorUsage = async (): Promise<EditorUsage> => (await Axios.get<{ data: EditorUsage }>('/editor/usage')).data.data;

/** `skill`: 'any' lists Skills tab edits, 'none' the classic editor's, an id that skill's; omitted lists all. */
export const listEditProjects = async (skill?: string): Promise<EditProjectSummary[]> =>
  (await Axios.get<{ data: { projects: EditProjectSummary[] } }>('/editor/projects', { params: skill ? { skill } : {} })).data.data.projects;

export const getEditProject = async (id: string): Promise<EditProjectDetail> =>
  (await Axios.get<{ data: EditProjectDetail }>(`/editor/projects/${id}`)).data.data;

export const createEditProject = async (file: File, skill: string | null = null): Promise<{ project: EditProjectSummary; upload: { url: string; method: 'PUT'; headers: Record<string, string> } }> =>
  (await Axios.post<{ data: { project: EditProjectSummary; upload: { url: string; method: 'PUT'; headers: Record<string, string> } } }>('/editor/projects', {
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    ...(skill ? { skill } : {}),
  })).data.data;

/**
 * Upload straight to storage with the signed URL. Plain XHR on purpose: the app's axios instance adds
 * auth headers, which would break the storage signature, and fetch has no upload progress.
 */
export const uploadToStorage = (url: string, file: File, headers: Record<string, string>, onProgress: (pct: number) => void, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));
    signal?.addEventListener('abort', () => xhr.abort());
    xhr.send(file);
  });

export const confirmEditUpload = async (id: string): Promise<EditProjectSummary> =>
  (await Axios.post<{ data: EditProjectSummary }>(`/editor/projects/${id}/uploaded`)).data.data;

export const saveEdits = async (id: string, edits: Edits): Promise<{ edits: Edits; props: PreviewProps; storyboard?: Storyboard }> =>
  (await Axios.patch<{ data: { edits: Edits; props: PreviewProps; storyboard?: Storyboard } }>(`/editor/projects/${id}/edits`, edits)).data.data;

/** Ask the planner for another treatment of one beat. */
export const swapStoryboardBeat = async (id: string, beatId: string): Promise<{ edits: Edits; props: PreviewProps; storyboard: Storyboard }> =>
  (await Axios.post<{ data: { edits: Edits; props: PreviewProps; storyboard: Storyboard } }>(`/editor/projects/${id}/storyboard/swap`, { beatId })).data.data;

export const regenerateEdit = async (id: string, note: string): Promise<void> => {
  await Axios.post(`/editor/projects/${id}/regenerate`, { note });
};

export const startRender = async (id: string): Promise<string> =>
  (await Axios.post<{ data: { renderId: string } }>(`/editor/projects/${id}/render`)).data.data.renderId;

export const getRender = async (id: string, renderId: string): Promise<RenderInfo> =>
  (await Axios.get<{ data: RenderInfo }>(`/editor/projects/${id}/render/${renderId}`)).data.data;

export const scoreEdit = async (id: string): Promise<string> =>
  (await Axios.post<{ data: { videoId: string } }>(`/editor/projects/${id}/score`)).data.data.videoId;

export const deleteEditProject = async (id: string): Promise<void> => {
  await Axios.delete(`/editor/projects/${id}`);
};

/** Editor extras (brand sheet, split screen, storyboard, screen recordings): off unless VITE_EDITOR_FEATURES_V2=true. */
export const editorFeaturesV2 = () => String(import.meta.env.VITE_EDITOR_FEATURES_V2 ?? '').toLowerCase() === 'true';

export const getBrand = async (): Promise<{ brand: Brand | null; fonts: string[] }> =>
  (await Axios.get<{ data: { brand: Brand | null; fonts: string[] } }>('/editor/brand')).data.data;

export const saveBrand = async (brand: Brand | null): Promise<Brand | null> =>
  (await Axios.put<{ data: { brand: Brand | null } }>('/editor/brand', { brand })).data.data.brand;

export const IN_PROGRESS: EditStatus[] = ['awaiting_upload', 'queued', 'preprocessing', 'planning'];
