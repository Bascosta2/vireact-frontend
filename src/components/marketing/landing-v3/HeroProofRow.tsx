import { winsData } from '@/components/Home/WinsSection/wins-data';
import { claims } from '@/content/claims';

/** 96px logo crop of the wide channel banner in /wins-avatars, so avatar rows don't download the full banner. */
export const avatarThumb = (src: string): string => src.replace('/wins-avatars/', '/wins-avatars/thumb/').replace(/\.png$/, '.webp');

/** Count text for the proof row. Only the verified summary may render a number; never fall back to claims.creatorCount. */
export const verifiedCreatorCount = (): string | null =>
  claims.creatorCountSummary.verified && claims.creatorCountSummary.value ? claims.creatorCountSummary.value : null;

/** Rating text, hidden unless the rating claim is verified. */
export const verifiedRatingLabel = (): string | null => {
  const { verified, value, count } = claims.ratingSummary;
  if (!verified || !value) return null;
  return count ? `${value} · ${count}` : value;
};

export function HeroProofRow() {
  const count = verifiedCreatorCount();
  const rating = verifiedRatingLabel();

  return (
    <div className="flex flex-wrap items-center gap-4 pt-4">
      <div className="flex -space-x-2">
        {winsData.slice(0, 4).map((win) => (
          <img
            key={win.name}
            src={avatarThumb(win.avatarSrc)}
            alt=""
            width={28}
            height={28}
            loading="lazy"
            decoding="async"
            className="h-7 w-7 rounded-full border border-zinc-900 object-cover"
          />
        ))}
      </div>
      {(count || rating) && (
        <p className="text-xs text-zinc-300" data-testid="hero-proof-text">
          {count && <span>Used by {count} creators</span>}
          {count && rating && <span> · </span>}
          {rating && <span>{rating}</span>}
        </p>
      )}
    </div>
  );
}
