import { useEffect, useState } from 'react';
import { Film } from 'lucide-react';
import { freshThumbnail } from '@/lib/thumbnail-refresh';
import { patchVideoSummary } from '@/lib/video-summaries';
import { cn } from '@/lib/utils';

// Warm, on-brand tiles so videos without a picture still look different from each other.
const TILES = [
  'from-[#3a1d12] to-[#1b1412]',
  'from-[#2a1a33] to-[#141219]',
  'from-[#13283a] to-[#11161c]',
  'from-[#1d2e1c] to-[#121812]',
  'from-[#33261a] to-[#18140f]',
];
const tileFor = (id: string) => TILES[[...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7) % TILES.length];

export function VideoThumb({
  video,
  className,
  iconClassName = 'h-6 w-6',
}: {
  video: { _id: string; thumbnailUrl?: string | null };
  className?: string;
  iconClassName?: string;
}) {
  const [src, setSrc] = useState<string | null>(video.thumbnailUrl ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(video.thumbnailUrl ?? null);
    setFailed(false);
  }, [video.thumbnailUrl]);

  const onError = () => {
    const broken = src;
    setFailed(true);
    void freshThumbnail(video._id).then((url) => {
      if (url && url !== broken) {
        setSrc(url);
        setFailed(false);
        patchVideoSummary(video._id, { thumbnailUrl: url });
      }
    });
  };

  return (
    <div className={cn('relative overflow-hidden bg-canvas', className)}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={onError} className="h-full w-full object-cover" />
      ) : (
        <div className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br text-fg-subtle', tileFor(video._id))} aria-hidden="true">
          <Film className={iconClassName} />
        </div>
      )}
    </div>
  );
}
