import type { CSSProperties } from 'react';
import type { AssetId } from '@/content/assets.manifest';
import { assetExists, getAssetSlot } from '@/content/assets.manifest';

interface AssetSlotProps {
  id: AssetId;
  alt: string;
  /** CSS aspect-ratio value, e.g. "4 / 5" or "9 / 16". */
  aspect: string;
  className?: string;
  rounded?: boolean;
  /** When true, hints to the browser that this asset is likely to be shown above the fold. */
  priority?: boolean;
  /** CSS object-position for the cropped image, e.g. "top". Defaults to centered. */
  objectPosition?: string;
}

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');

export function AssetSlot({ id, alt, aspect, className, rounded = true, priority, objectPosition }: AssetSlotProps) {
  const slot = getAssetSlot(id);
  const hasAsset = slot ? assetExists(slot.id) : false;

  const borderRadius = rounded ? 'rounded-2xl' : 'rounded-lg';

  const containerClasses = cx('relative overflow-hidden border border-white/10 bg-white/5', borderRadius, className);

  const style: CSSProperties = {
    aspectRatio: aspect,
  };

  if (!slot || !hasAsset || !slot.src) {
    // Placeholder: full dev text in development, subtle neutral gradient only in production.
    return (
      <div
        className={cx(
          containerClasses,
          'flex items-center justify-center border-dashed bg-gradient-to-br from-zinc-900/80 to-zinc-800/60'
        )}
        style={style}
        {...(import.meta.env.PROD ? { 'aria-hidden': true } : { role: 'img', 'aria-label': alt })}
      >
        {!import.meta.env.PROD && (
          <div className="px-4 text-center text-xs text-zinc-300 space-y-1">
            <div className="font-medium text-zinc-100">{id}</div>
            <div className="text-zinc-300">
              {slot ? slot.recommended : 'Add this slot to assets.manifest.ts'}
            </div>
            {slot && <div className="text-zinc-400">{slot.description}</div>}
          </div>
        )}
      </div>
    );
  }

  if (slot.type === 'video') {
    return (
      <div className={containerClasses} style={style}>
        <video
          className="h-full w-full object-cover"
          src={slot.src}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt}
        />
      </div>
    );
  }

  return (
    <div className={containerClasses} style={style}>
      <img
        src={slot.src}
        alt={alt}
        width={slot.width}
        height={slot.height}
        className={cx('h-full w-full object-cover', borderRadius)}
        style={objectPosition ? { objectPosition } : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

