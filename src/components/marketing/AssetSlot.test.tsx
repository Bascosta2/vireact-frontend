import { describe, expect, it, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

describe('AssetSlot', () => {
  beforeEach(() => {
    // Reset test-only asset map and env between runs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__TEST_BRAND_ASSET_FILES__ = undefined;
    (import.meta as any).env.PROD = false;
  });

  it('renders a placeholder when the asset file is missing', async () => {
    vi.resetModules();
    const { AssetSlot } = await import('./AssetSlot');
    const html = renderToStaticMarkup(
      React.createElement(AssetSlot, { id: 'hero-founder', alt: 'Hero', aspect: '4 / 5' })
    );
    expect(html).toMatch(/hero-founder/);
    expect(html).toMatch(/1200×1500 WebP/);
  });

  it('renders an image when the asset file exists and hides dev text in production', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__TEST_BRAND_ASSET_FILES__ = { '/public/brand/hero-founder.webp': true };
    (import.meta as any).env.PROD = true;
    vi.resetModules();
    const { AssetSlot } = await import('./AssetSlot');
    const html = renderToStaticMarkup(
      React.createElement(AssetSlot, { id: 'hero-founder', alt: 'Hero', aspect: '4 / 5' })
    );
    expect(html).toContain('<img');
    // Developer placeholder copy should not render in production.
    expect(html).not.toMatch(/Add this slot/);
    expect(html).not.toMatch(/1200×1500 WebP/);
  });
});

