import { useMemo, useState, type ReactNode } from 'react';
import { BookOpen, Film, Flame, Loader2 } from 'lucide-react';
import { Tabs, type TabDef } from '@/components/app/Tabs';
import { Button } from '@/components/app/Button';
import { Select } from '@/components/app/Select';
import { cn } from '@/lib/utils';
import type { CaptionPreset } from '@/remotion/types';
import type { EditProjectDetail, Edits, Evidence, PreviewProps } from '@/api/editor';

type PanelTab = 'changes' | 'captions' | 'hook' | 'sound' | 'ask';
const TABS: TabDef<PanelTab>[] = [
  { id: 'changes', label: 'Changes' },
  { id: 'captions', label: 'Captions' },
  { id: 'hook', label: 'Hook' },
  { id: 'sound', label: 'Sound' },
  { id: 'ask', label: 'Ask for changes' },
];

const EVIDENCE: Record<Evidence, { label: string; icon: typeof BookOpen }> = {
  knowledge: { label: 'Vireact playbook', icon: BookOpen },
  viral_example: { label: 'Viral examples', icon: Flame },
  footage: { label: 'Your footage', icon: Film },
};

const PRESETS: { id: CaptionPreset; label: string; hint: string }[] = [
  { id: 'bold_pop', label: 'Bold pop', hint: 'Big uppercase words that pop as they are said' },
  { id: 'clean', label: 'Clean', hint: 'Calm sentence captions on a dark pill' },
  { id: 'karaoke', label: 'Karaoke', hint: 'Words light up as they are spoken' },
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
  const showFraming = plan.framing.mode === 'fit_blur' || landscape;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-fg">{plan.summary}</p>
        {plan.expectedEffect && <p className="mt-2 text-sm text-fg-muted">{plan.expectedEffect}</p>}
      </div>
      <ul className="space-y-3">
        {plan.changes.map((c, k) => {
          const ev = EVIDENCE[c.evidence];
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
        {plan.overlayCount > 0 && <Toggle checked={!edits.overlaysOff} onChange={(v) => onEdit({ overlaysOff: !v })} label={`Text on screen (${plan.overlayCount})`} />}
        {plan.sfxCount > 0 && <Toggle checked={!edits.sfxOff} onChange={(v) => onEdit({ sfxOff: !v })} label={`Sound effects (${plan.sfxCount})`} />}
        {showFraming ? (
          <Toggle
            checked={(edits.framingMode ?? plan.framing.mode) === 'fill'}
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

function CaptionsTab({ props, edits, onEdit, onEditText }: { props: PreviewProps; edits: Edits; onEdit: (e: Edits) => void; onEditText: (i: number, text: string) => void }) {
  const preset = props.captions?.preset ?? edits.captionPreset ?? 'bold_pop';
  const pages = props.captions?.pages ?? [];
  return (
    <div className="space-y-5">
      <Toggle checked={!edits.captionsOff} onChange={(v) => onEdit({ captionsOff: !v })} label="Captions" />
      {!edits.captionsOff && (
        <>
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

function HookTab({ project, edits, onEdit }: { project: EditProjectDetail; edits: Edits; onEdit: (e: Edits) => void }) {
  const plan = project.plan!;
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
            </label>
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
  const [tab, setTab] = useState<PanelTab>('changes');
  return (
    <Tabs tabs={TABS} value={tab} onChange={setTab} label="Edit settings">
      <div className="pt-2">
        {tab === 'changes' && <ChangesTab project={project} edits={edits} onEdit={onEdit} />}
        {tab === 'captions' && <CaptionsTab props={props} edits={edits} onEdit={onEdit} onEditText={onEditText} />}
        {tab === 'hook' && <HookTab project={project} edits={edits} onEdit={onEdit} />}
        {tab === 'sound' && <SoundTab project={project} props={props} edits={edits} onEdit={onEdit} />}
        {tab === 'ask' && <AskTab project={project} onRegenerate={onRegenerate} />}
      </div>
    </Tabs>
  );
}
