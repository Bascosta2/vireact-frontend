import { useMemo, useState, type ReactNode } from 'react';
import { BookOpen, Film, Flame, Loader2 } from 'lucide-react';
import { Tabs, type TabDef } from '@/components/app/Tabs';
import { Button } from '@/components/app/Button';
import { Select } from '@/components/app/Select';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';
import type { CaptionPreset } from '@/remotion/types';
import { isStyleId, type StyleId } from '@/remotion/styles/ids';
import { editorFeaturesV2, type EditProjectDetail, type Edits, type Evidence, type PreviewProps } from '@/api/editor';
import { ANIMATION_STYLES, skillById } from '../Skills/catalog';
import { ShowcaseThumbnail } from '../Skills/ShowcasePlayer';

type PanelTab = 'style' | 'changes' | 'captions' | 'hook' | 'sound' | 'ask';
const TABS: TabDef<PanelTab>[] = [
  { id: 'changes', label: 'Changes' },
  { id: 'captions', label: 'Captions' },
  { id: 'hook', label: 'Hook' },
  { id: 'sound', label: 'Sound' },
  { id: 'ask', label: 'Ask for changes' },
];
/** Edits made with an animation style open on the Style tab, where the style can be switched. */
const STYLE_TABS: TabDef<PanelTab>[] = [{ id: 'style', label: 'Style' }, ...TABS];

/** The animation style an edit is drawn in now (null for other edits). */
const activeStyle = (project: Pick<EditProjectDetail, 'skill'>, edits: Edits): StyleId | null =>
  isStyleId(project.skill) ? (isStyleId(edits.animationStyle) ? edits.animationStyle : project.skill) : null;

const EVIDENCE: Record<Evidence, { label: string; icon: typeof BookOpen }> = {
  knowledge: { label: 'Vireact playbook', icon: BookOpen },
  viral_example: { label: 'Viral examples', icon: Flame },
  footage: { label: 'Your footage', icon: Film },
};

/** Every look shows 2 to 3 words at a time in the middle of the screen; none follows the spoken word. */
const PRESETS: { id: CaptionPreset; label: string; hint: string }[] = [
  { id: 'bold_pop', label: 'Bold', hint: 'Heavy white capitals, 2 to 3 words at a time' },
  { id: 'highlight', label: 'Highlight', hint: 'Key words sit in a colored box' },
  { id: 'impact', label: 'Impact', hint: 'Tall condensed capitals, 2 words at a time' },
  { id: 'clean', label: 'Clean', hint: 'Calm sentence case on a dark pill' },
];

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; description?: ReactNode }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="app-focus flex w-full items-start justify-between gap-3 rounded-lg px-1 py-2 text-left hover:bg-white/[0.03]"
    >
      <span className="min-w-0">
        <span className="block text-sm text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-fg-muted">{description}</span>}
      </span>
      <span aria-hidden="true" className={cn('relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-white/15')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </span>
    </button>
  );
}

const toggleIn = <T,>(list: T[] | undefined, value: T, include: boolean) => {
  const set = new Set(list ?? []);
  if (include) set.add(value);
  else set.delete(value);
  return [...set];
};

function ChangesTab({ project, edits, onEdit }: { project: EditProjectDetail; edits: Edits; onEdit: (e: Edits) => void }) {
  const plan = project.plan!;
  const reordered = plan.segments.some((s, i) => i > 0 && s.start < plan.segments[i - 1].start);
  const removedSec = project.candidates.reduce((n, c) => n + (c.end - c.start), 0);
  const landscape = Boolean(project.source && project.source.width > project.source.height);
  // With the flag off a saved split edit plays as fill, so the fill/fit control treats it as fill.
  const mode = plan.framing.mode === 'split' && !editorFeaturesV2() ? 'fill' : plan.framing.mode;
  const framingNow = edits.framingMode ?? mode;
  const showFraming = mode === 'fit_blur' || landscape;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-fg">{plan.summary}</p>
        {plan.expectedEffect && <p className="mt-2 text-sm text-fg-muted">{plan.expectedEffect}</p>}
      </div>
      <ul className="space-y-3">
        {plan.changes.map((c, k) => {
          const ev = EVIDENCE[c.evidence] ?? EVIDENCE.footage;
          return (
            <li key={k} className="rounded-lg border border-line p-3">
              <p className="text-sm font-medium text-fg">{c.label}</p>
              <p className="mt-1 text-sm text-fg-muted">{c.why}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-fg-muted">
                <ev.icon className="h-3 w-3" aria-hidden="true" />
                {ev.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div>
        <h3 className="app-label mb-1">Fine-tune</h3>
        {reordered && (
          <Toggle
            checked={!edits.keepOriginalOrder}
            onChange={(v) => onEdit({ keepOriginalOrder: !v })}
            label="Open on the strongest moment"
            description="Turn off to keep your original order."
          />
        )}
        {plan.zooms.length > 0 && <Toggle checked={!edits.zoomsOff} onChange={(v) => onEdit({ zoomsOff: !v })} label={`Zooms (${plan.zooms.length})`} />}
        {plan.overlayCount > 0 && <Toggle checked={!edits.overlaysOff} onChange={(v) => onEdit({ overlaysOff: !v })} label={`Text, graphics and illustrations (${plan.overlayCount})`} />}
        {(plan.transitionCount ?? 0) > 0 && <Toggle checked={!edits.transitionsOff} onChange={(v) => onEdit({ transitionsOff: !v })} label={`Transitions and jump-cut zooms (${plan.transitionCount})`} />}
        {(plan.effectCount ?? 0) > 0 && <Toggle checked={!edits.effectsOff} onChange={(v) => onEdit({ effectsOff: !v })} label={`Shake and flash effects (${plan.effectCount})`} />}
        {plan.sfxCount > 0 && <Toggle checked={!edits.sfxOff} onChange={(v) => onEdit({ sfxOff: !v })} label={`Sound effects (${plan.sfxCount})`} />}
        {editorFeaturesV2() && (
          <Toggle
            checked={framingNow === 'split'}
            onChange={(v) => onEdit({ framingMode: v ? 'split' : 'fill' })}
            label="Split screen"
            description="You on top, a zoomed detail of the same shot below."
          />
        )}
        {showFraming && framingNow !== 'split' ? (
          <Toggle
            checked={framingNow === 'fill'}
            onChange={(v) => onEdit({ framingMode: v ? 'fill' : 'fit_blur' })}
            label="Fill the vertical frame"
            description="Off shows the whole shot on a blurred background."
          />
        ) : null}
      </div>

      <div>
        <h3 className="app-label mb-2">Parts kept, in play order</h3>
        <ul className="space-y-1">
          {plan.segments.map((s) => (
            <li key={s.id}>
              <Toggle
                checked={!(edits.disabledSegments ?? []).includes(s.id)}
                onChange={(v) => onEdit({ disabledSegments: toggleIn(edits.disabledSegments, s.id, !v) })}
                label={<span className="tabular">{mmss(s.start)}–{mmss(s.end)} <span className="text-fg-muted">· {s.role}</span></span>}
                description={s.reason}
              />
            </li>
          ))}
        </ul>
      </div>

      {project.candidates.length > 0 && (
        <div>
          <h3 className="app-label mb-1">Pauses and filler removed</h3>
          <p className="tabular mb-2 text-xs text-fg-muted">{project.candidates.length} cuts, {removedSec.toFixed(1)}s in total. Turn one off to put it back.</p>
          <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {project.candidates.map((c) => (
              <li key={c.id}>
                <Toggle
                  checked={!(edits.restoredCandidates ?? []).includes(c.id)}
                  onChange={(v) => onEdit({ restoredCandidates: toggleIn(edits.restoredCandidates, c.id, !v) })}
                  label={<span className="tabular">{mmss(c.start)} · {c.text ? `“${c.text}”` : c.kind.replace('_', ' ')}</span>}
                  description={`${(c.end - c.start).toFixed(1)}s`}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const STYLE_GROUPS = [
  { id: 'talking-head', title: 'For talking heads' },
  { id: 'any-footage', title: 'For any footage' },
  { id: 'storytelling', title: 'Animated storytelling' },
] as const;

/** Switch an animation-style edit to another style: the cut stays, only the look changes. */
function StyleTab({ project, edits, onEdit }: { project: EditProjectDetail; edits: Edits; onEdit: (e: Edits) => void }) {
  const current = activeStyle(project, edits);
  const info = skillById(current);
  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">Pick another animation style and the preview redraws right away. Your cut, captions, hook and graphics stay the same.</p>
      {info?.category === 'storytelling' && (
        <Toggle
          checked={!edits.sceneOff}
          onChange={(v) => onEdit({ sceneOff: !v })}
          label="Painted scene"
          description={edits.sceneOff ? 'Your footage shows, in the style.' : 'The style paints the whole frame and your voice narrates it. Turn off to show your footage.'}
        />
      )}
      {STYLE_GROUPS.map((g) => (
        <div key={g.id}>
          <h3 className="app-label mb-2">{g.title}</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {ANIMATION_STYLES.filter((s) => s.category === g.id).map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={current === s.id}
                onClick={() => {
                  if (current === s.id) return;
                  track('edit_style_switched', { project_id: project.id, from: current, to: s.id });
                  onEdit({ animationStyle: s.id as StyleId });
                }}
                className={cn('app-focus flex flex-col gap-1.5 rounded-lg border p-1.5 text-left', current === s.id ? 'border-accent bg-accent-tint' : 'border-line hover:bg-white/[0.03]')}
              >
                <ShowcaseThumbnail showcase={s.hero} className="w-full" />
                <span className="px-0.5 text-xs font-medium text-fg">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {info && (
        <div className="rounded-lg border border-line p-3">
          <p className="text-sm font-medium text-fg">{info.name}</p>
          <p className="mt-1 text-xs text-fg-muted">{info.tagline}</p>
        </div>
      )}
      <p className="text-xs text-fg-subtle">The AI planned this edit for {skillById(project.skill)?.name ?? 'its first style'}. To plan it again around the new style, use Ask for changes.</p>
    </div>
  );
}

function CaptionsTab({ props, edits, onEdit, onEditText }: { props: PreviewProps; edits: Edits; onEdit: (e: Edits) => void; onEditText: (i: number, text: string) => void }) {
  const preset = props.captions?.preset ?? edits.captionPreset ?? 'bold_pop';
  const pages = props.captions?.pages ?? [];
  const skillLook = props.skill?.id === 'remotion-reel';
  const styleName = props.skill && isStyleId(props.skill.id) ? skillById(props.skill.id)?.name : null;
  return (
    <div className="space-y-5">
      <Toggle checked={!edits.captionsOff} onChange={(v) => onEdit({ captionsOff: !v })} label="Captions" />
      {!edits.captionsOff && (
        <>
          {skillLook ? (
            <p className="rounded-lg border border-line p-3 text-xs text-fg-muted">Captions follow the Remotion Reel style: outlined, lowercase, 1 to 3 words, gone the moment you stop speaking.</p>
          ) : styleName ? (
            <p className="rounded-lg border border-line p-3 text-xs text-fg-muted">Captions are drawn in the {styleName} style. Change the style on the Style tab.</p>
          ) : (
          <fieldset>
            <legend className="app-label mb-2">Style</legend>
            <div className="grid gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={preset === p.id}
                  onClick={() => onEdit({ captionPreset: p.id })}
                  className={cn('app-focus rounded-lg border p-3 text-left', preset === p.id ? 'border-accent bg-accent-tint' : 'border-line hover:bg-white/[0.03]')}
                >
                  <span className="block text-sm font-medium text-fg">{p.label}</span>
                  <span className="block text-xs text-fg-muted">{p.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          )}
          <div>
            <h3 className="app-label mb-2">Fix words</h3>
            <p className="mb-2 text-xs text-fg-muted">Change a word if the transcript got it wrong. Highlighted words are emphasized.</p>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {pages.map((page, k) => (
                <div key={k} className="flex flex-wrap gap-1.5">
                  {page.words.map((w) => (
                    <input
                      key={w.i}
                      aria-label={`Caption word ${w.i + 1}`}
                      defaultValue={w.text}
                      maxLength={40}
                      size={Math.max(2, w.text.length)}
                      onBlur={(e) => e.target.value.trim() !== w.text && onEditText(w.i, e.target.value)}
                      className={cn('app-focus rounded-md border border-line bg-canvas px-1.5 py-1 text-sm', w.emphasis ? 'text-[#FFD43B]' : 'text-fg')}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const HOOK_STYLES: { id: NonNullable<Edits['hookVariant']>; label: string; hint: string }[] = [
  { id: 'white', label: 'White', hint: 'Black text on a white sticker' },
  { id: 'black', label: 'Black', hint: 'White text on a black sticker' },
  { id: 'plain', label: 'Plain', hint: 'White text with an outline, no sticker' },
];

function HookTab({ project, edits, onEdit }: { project: EditProjectDetail; edits: Edits; onEdit: (e: Edits) => void }) {
  const plan = project.plan!;
  const skillHook = project.skill === 'remotion-reel';
  // Remotion Reel and the animation styles break the hook into lines where the creator puts a slash.
  const lineBreaks = skillHook || isStyleId(project.skill);
  const variant = edits.hookVariant ?? 'white';
  const [text, setText] = useState(edits.hookText ?? plan.hookOverlay.text);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line p-3">
        <p className="app-label">How the edit opens</p>
        <p className="mt-1 text-sm text-fg">{plan.hookStrategy}</p>
      </div>
      {plan.hookOverlay.enabled ? (
        <>
          <Toggle checked={!edits.hookOverlayOff} onChange={(v) => onEdit({ hookOverlayOff: !v })} label="Text over the first seconds" />
          {!edits.hookOverlayOff && (
            <label className="block text-xs text-fg-muted">
              Hook text <span className="text-fg-subtle">(up to 60 characters)</span>
              <input
                value={text}
                maxLength={60}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => text.trim() && text !== (edits.hookText ?? plan.hookOverlay.text) && onEdit({ hookText: text.trim() })}
                className="app-focus mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-3 text-base text-fg md:text-sm"
              />
              {lineBreaks && <span className="mt-1 block text-fg-subtle">Put a slash where the second line starts, like: How to start / if you&rsquo;re shy</span>}
            </label>
          )}
          {skillHook && !edits.hookOverlayOff && (
            <fieldset>
              <legend className="app-label mb-2">Hook style</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {HOOK_STYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    aria-pressed={variant === h.id}
                    onClick={() => onEdit({ hookVariant: h.id })}
                    className={cn('app-focus rounded-lg border p-3 text-left', variant === h.id ? 'border-accent bg-accent-tint' : 'border-line hover:bg-white/[0.03]')}
                  >
                    <span className="block text-sm font-medium text-fg">{h.label}</span>
                    <span className="block text-xs text-fg-muted">{h.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </>
      ) : (
        <p className="text-sm text-fg-muted">This edit opens without a text overlay, because your first line already says what the video is about.</p>
      )}
    </div>
  );
}

function SoundTab({ project, props, edits, onEdit }: { project: EditProjectDetail; props: PreviewProps; edits: Edits; onEdit: (e: Edits) => void }) {
  const plan = project.plan!;
  const tracks = useMemo(() => project.tracks ?? [], [project.tracks]);
  const current = 'musicTrackId' in edits ? edits.musicTrackId ?? '' : plan.music.trackId ?? '';
  const options = useMemo(() => [{ value: '', label: 'No music' }, ...tracks.map((t) => ({ value: t.slug, label: `${t.title}${t.mood ? ` · ${t.mood}` : ''}` }))], [tracks]);
  const [volume, setVolume] = useState(edits.musicVolume ?? plan.music.volume);
  return (
    <div className="space-y-5">
      {plan.music.reason && <p className="text-sm text-fg-muted">{plan.music.reason}</p>}
      {tracks.length > 0 ? (
        <Select id="editor-music" label="Music" value={current} options={options} onChange={(v) => onEdit({ musicTrackId: v || null })} />
      ) : (
        <p className="text-sm text-fg-muted">No music tracks are available yet.</p>
      )}
      {current && (
        <label className="block text-xs text-fg-muted">
          Music volume
          <input
            type="range"
            min={0}
            max={0.6}
            step={0.02}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            onPointerUp={() => onEdit({ musicVolume: volume })}
            onKeyUp={() => onEdit({ musicVolume: volume })}
            className="mt-2 w-full accent-[var(--app-accent)]"
          />
        </label>
      )}
      {props.musicAttribution && <p className="text-xs text-fg-subtle">Music: {props.musicAttribution}</p>}
      {plan.sfxCount > 0 && <Toggle checked={!edits.sfxOff} onChange={(v) => onEdit({ sfxOff: !v })} label="Sound effects" />}
      <p className="text-xs text-fg-subtle">Want a trending sound? Add it inside TikTok or Instagram when you post. We only use tracks we have the rights to.</p>
    </div>
  );
}

function AskTab({ project, onRegenerate }: { project: EditProjectDetail; onRegenerate: (note: string) => Promise<void> }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const left = project.regenerationsLeft;
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onRegenerate(note.trim());
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="text-sm text-fg-muted">Tell the editor what to change and it will plan the edit again. It still uses only your footage.</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        rows={4}
        placeholder="e.g. Keep the intro about my background, and use calmer captions"
        className="app-focus w-full rounded-lg border border-line bg-canvas p-3 text-base text-fg placeholder:text-fg-subtle md:text-sm"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || left === 0 || note.trim().length < 3}>
          {busy && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />}
          Redo the edit
        </Button>
        <span className="text-xs text-fg-muted">{left === 0 ? 'No redos left for this edit.' : `${left} redo${left === 1 ? '' : 's'} left. Your current changes reset.`}</span>
      </div>
    </form>
  );
}

export default function ReviewPanel({
  project,
  props,
  edits,
  onEdit,
  onEditText,
  onRegenerate,
}: {
  project: EditProjectDetail;
  props: PreviewProps;
  edits: Edits;
  onEdit: (e: Edits) => void;
  onEditText: (i: number, text: string) => void;
  onRegenerate: (note: string) => Promise<void>;
}) {
  const styled = isStyleId(project.skill);
  const [tab, setTab] = useState<PanelTab>(styled ? 'style' : 'changes');
  return (
    <Tabs tabs={styled ? STYLE_TABS : TABS} value={tab} onChange={setTab} label="Edit settings">
      <div className="pt-2">
        {tab === 'style' && styled && <StyleTab project={project} edits={edits} onEdit={onEdit} />}
        {tab === 'changes' && <ChangesTab project={project} edits={edits} onEdit={onEdit} />}
        {tab === 'captions' && <CaptionsTab props={props} edits={edits} onEdit={onEdit} onEditText={onEditText} />}
        {tab === 'hook' && <HookTab project={project} edits={edits} onEdit={onEdit} />}
        {tab === 'sound' && <SoundTab project={project} props={props} edits={edits} onEdit={onEdit} />}
        {tab === 'ask' && <AskTab project={project} onRegenerate={onRegenerate} />}
      </div>
    </Tabs>
  );
}
