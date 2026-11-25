import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { EditProjectDetail, StoryboardOption } from '@/api/editor';
import StoryboardChooser from './StoryboardChooser';

const option = (title: string): StoryboardOption => ({
  title,
  logline: 'A fox outsmarts a fire.',
  angle: `${title} angle`,
  mood: 'inspiring',
  musicTrackId: 'rise',
  scenes: [
    { narration: 'Deep in the forest lived a small red fox.', backdrop: 'nature', emphasis: ['fox'], graphic: { type: 'visual', text: '', subtext: '', items: [], visual: 'plant' } },
    { narration: 'One dry summer, smoke rose over the hills.', backdrop: 'space', emphasis: [], graphic: { type: 'counter', text: '3 days', subtext: 'without rain', items: [] } },
    { narration: 'The fire stopped at her line.', backdrop: 'scene', emphasis: [], graphic: null },
  ],
});

const project = {
  id: 'p1',
  title: 'A fox',
  skill: 'glow-sketch',
  kind: 'storyboard',
  status: 'choosing',
  storyboard: { prompt: 'A tiny fox saves her forest', lengthSec: 30, options: [option('One'), option('Two'), option('Three')], chosen: null, final: null, roundsLeft: 2 },
} as unknown as EditProjectDetail;

describe('story mode', () => {
  it('shows the three storyboards with their scenes, backdrops and graphics; nothing is made before a pick and a confirm', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StoryboardChooser project={project} onDone={() => {}} onRegenerated={async () => {}} />
      </MemoryRouter>,
    );
    expect(html).toContain('Pick your storyboard');
    for (const t of ['One', 'Two', 'Three']) expect(html).toContain(`>${t}<`);
    expect(html.match(/Storyboard \d/g)).toHaveLength(3);
    expect(html).toContain('Mountains and lake');
    expect(html).toContain('Outer space');
    expect(html).toContain('Illustration: plant');
    expect(html).toContain('Number: 3 days (without rain)');
    expect(html).toContain('A tiny fox saves her forest');
    expect(html).toContain('2 new rounds left');
    // The confirm step only appears after a storyboard is picked.
    expect(html).not.toContain('Confirm and animate');
    expect(html).not.toContain('Use this storyboard');
  });
});
