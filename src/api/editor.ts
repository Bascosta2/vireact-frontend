import type { StyleId } from '@/remotion/styles/ids';
import Axios from './index';
import type { CaptionPreset, EditProps } from '@/remotion/types';

/** `choosing`: story mode's storyboards are written and wait for the creator to pick one. */
export type EditStatus = 'awaiting_upload' | 'queued' | 'preprocessing' | 'planning' | 'choosing' | 'ready' | 'failed';
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
  /** 'storyboard': animated from a typed idea (story mode); 'upload': an edit of the creator's video. */
  kind?: 'upload' | 'storyboard';
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
  framing: { mode: 'fill' | 'fit_blur'; focusX: number };
  /** Counts with every layer on (sounds include the automatic sound design). */
  sfxCount: number;
  overlayCount: number;
  transitionCount?: number;
  effectCount?: number;
  graphics?: { type: string; text: string }[];
  look?: { grade: string; accent: string; progressBar: boolean; motion: boolean };
}

export interface Edits {
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
  framingMode?: 'fill' | 'fit_blur';
  /** Text hook style of the Remotion Reel skill. */
  hookVariant?: 'white' | 'black' | 'plain';
  /** Another animation style for an edit made with one (Style tab); the backend ignores it for other edits. */
  animationStyle?: StyleId;
  /** Storytelling styles: show the creator's footage instead of the painted scene. */
  sceneOff?: boolean;
}

export type PreviewProps = Omit<EditProps, 'videoUrl'>;

export interface RenderInfo {
  id: string;
  status: 'rendering' | 'done' | 'failed';
  progress: number;
  error: string | null;
  createdAt?: string;
  downloadUrl?: string | null;
  /** True when the creator changed the edit (e.g. switched animation style) after this render was baked. */
  stale?: boolean;
}

export interface EditProjectDetail extends EditProjectSummary {
  source: { durationSec: number; width: number; height: number; hasAudio: boolean } | null;
  regenerationsLeft: number;
  billing: 'trial' | 'plan' | null;
  renders: RenderInfo[];
  linkedVideoId: string | null;
  plan: EditPlanView | null;
  edits: Edits;
  props: PreviewProps | null;
  proxyUrl: string | null;
  candidates: { id: string; kind: string; start: number; end: number; text: string | null }[];
  words: { i: number; w: string; start: number }[];
  tracks?: { slug: string; title: string; mood: string | null; energy: number | null }[];
  /** Story mode only. */
  storyboard?: StoryboardView | null;
}

/** One graphic in a storyboard scene. */
export interface StoryboardGraphic {
  type: 'headline' | 'list' | 'counter' | 'chart' | 'visual' | 'slam' | 'pill' | 'cta';
  text: string;
  subtext: string;
  items: string[];
  visual?: string;
}

export interface StoryboardScene {
  /** The words shown on screen for this scene. */
  narration: string;
  /** What is behind the words (a backdrop id), or 'scene' when the style paints its own world. */
  backdrop: string;
  emphasis: string[];
  graphic: StoryboardGraphic | null;
}

export interface StoryboardOption {
  title: string;
  logline: string;
  angle: string;
  mood: string;
  musicTrackId: string;
  scenes: StoryboardScene[];
}

export interface StoryboardView {
  prompt: string;
  lengthSec: number;
  options: StoryboardOption[];
  chosen: number | null;
  final: { title: string; scenes: StoryboardScene[] } | null;
  roundsLeft: number;
}

export const getEditorUsage = async (): Promise<EditorUsage> => (await Axios.get<{ data: EditorUsage }>('/editor/usage')).data.data;

/** `skill`: 'any' lists Skills tab edits, 'none' the classic editor's, an id that skill's; omitted lists all. */
export const listEditProjects = async (skill?: string): Promise<EditProjectSummary[]> =>
  (await Axios.get<{ data: { projects: EditProjectSummary[] } }>('/editor/projects', { params: skill ? { skill } : {} })).data.data.projects;

export const getEditProject = async (id: string): Promise<EditProjectDetail> =>
  (await Axios.get<{ data: EditProjectDetail }>(`/editor/projects/${id}`)).data.data;

/** `animationNote` is an optional 500-char creator brief (how they want the animation to feel); the planner reads it as top-priority steering. */
export const createEditProject = async (file: File, skill: string | null = null, animationNote = ''): Promise<{ project: EditProjectSummary; upload: { url: string; method: 'PUT'; headers: Record<string, string> } }> =>
  (await Axios.post<{ data: { project: EditProjectSummary; upload: { url: string; method: 'PUT'; headers: Record<string, string> } } }>('/editor/projects', {
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    ...(skill ? { skill } : {}),
    ...(animationNote.trim() ? { animationNote: animationNote.trim().slice(0, 500) } : {}),
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

export const saveEdits = async (id: string, edits: Edits): Promise<{ edits: Edits; props: PreviewProps }> =>
  (await Axios.patch<{ data: { edits: Edits; props: PreviewProps } }>(`/editor/projects/${id}/edits`, edits)).data.data;

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

export const IN_PROGRESS: EditStatus[] = ['awaiting_upload', 'queued', 'preprocessing', 'planning'];

/** Story mode: start a video from a typed idea; three storyboards get written, then the creator picks one. */
export const createStoryboard = async (prompt: string, style: string, lengthSec: number): Promise<EditProjectSummary> =>
  (await Axios.post<{ data: EditProjectSummary }>('/editor/storyboards', { prompt, style, lengthSec })).data.data;

/** Confirm a storyboard (with the creator's own words per scene, if they changed any) and build the video. */
export const chooseStoryboard = async (id: string, option: number, title: string, narrations: string[]): Promise<EditProjectDetail> =>
  (await Axios.post<{ data: EditProjectDetail }>(`/editor/projects/${id}/storyboard/choose`, { option, title, narrations })).data.data;

/** Three new storyboards, following the creator's note. */
export const regenerateStoryboards = async (id: string, note: string): Promise<void> => {
  await Axios.post(`/editor/projects/${id}/storyboard/regenerate`, { note });
};

export const STORY_LENGTHS = [15, 30, 45, 60] as const;
