/** Which Home cards show, and in what order. Kept in this browser; "Reset layout" goes back to the default. */

export type HomeWidgetId = 'next' | 'metrics' | 'recent' | 'plan' | 'guide';

export interface HomeLayout {
  order: HomeWidgetId[];
  hidden: HomeWidgetId[];
}

export const HOME_WIDGETS: { id: HomeWidgetId; name: string }[] = [
  { id: 'next', name: 'Next step' },
  { id: 'metrics', name: 'Your numbers' },
  { id: 'recent', name: 'Recent results' },
  { id: 'plan', name: 'Posting plan' },
  { id: 'guide', name: 'Your workflow' },
];

const IDS = HOME_WIDGETS.map((w) => w.id);

export const DEFAULT_HOME_LAYOUT: HomeLayout = { order: [...IDS], hidden: [] };

const KEY = 'vireact_home_layout_v1';

/** Drops unknown cards and adds new ones at the end, so an old saved layout never hides a new card. */
export function sanitizeLayout(raw: unknown): HomeLayout {
  const r = (raw ?? {}) as Partial<HomeLayout>;
  const order = (Array.isArray(r.order) ? r.order : []).filter((id, i, a): id is HomeWidgetId => IDS.includes(id as HomeWidgetId) && a.indexOf(id) === i);
  for (const id of IDS) if (!order.includes(id)) order.push(id);
  const hidden = (Array.isArray(r.hidden) ? r.hidden : []).filter((id, i, a): id is HomeWidgetId => IDS.includes(id as HomeWidgetId) && a.indexOf(id) === i);
  return { order, hidden };
}

export function readHomeLayout(): HomeLayout {
  try {
    return sanitizeLayout(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return { ...DEFAULT_HOME_LAYOUT, order: [...DEFAULT_HOME_LAYOUT.order] };
  }
}

export function writeHomeLayout(layout: HomeLayout) {
  try {
    localStorage.setItem(KEY, JSON.stringify(layout));
  } catch {
    // private window: this visit only
  }
}

/** Moves a card one place up or down among the visible ones. */
export function moveWidget(layout: HomeLayout, id: HomeWidgetId, dir: -1 | 1): HomeLayout {
  const visible = layout.order.filter((w) => !layout.hidden.includes(w));
  const i = visible.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= visible.length) return layout;
  const swapWith = visible[j];
  const order = [...layout.order];
  const a = order.indexOf(id);
  const b = order.indexOf(swapWith);
  [order[a], order[b]] = [order[b], order[a]];
  return { ...layout, order };
}

export function setWidgetHidden(layout: HomeLayout, id: HomeWidgetId, hidden: boolean): HomeLayout {
  const rest = layout.hidden.filter((w) => w !== id);
  return { ...layout, hidden: hidden ? [...rest, id] : rest };
}

export const isDefaultLayout = (l: HomeLayout) => l.hidden.length === 0 && l.order.join() === DEFAULT_HOME_LAYOUT.order.join();
