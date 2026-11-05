import { Star } from 'lucide-react';
import { winsData } from '@/components/Home/WinsSection/wins-data';
import { claims } from '@/content/claims';
import { avatarThumb, ratingScore, verifiedCreatorCount, verifiedRatingLabel } from './hero-data';

/** Five stars filled to the score; the partial star is clipped, not rounded. */
export function RatingStars({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, score - i));
        return (
          <span key={i} className="relative h-4 w-4">
            <Star className="absolute inset-0 h-4 w-4 text-amber-400/35" strokeWidth={1.5} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${Math.round(fill * 100)}%` }}>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" strokeWidth={1.5} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function HeroProofRow({ className = '' }: { className?: string }) {
  const count = verifiedCreatorCount();
  const rating = verifiedRatingLabel();
  const score = rating ? ratingScore(claims.ratingSummary.value) : null;

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      <div className="flex -space-x-2">
        {winsData.slice(0, 4).map((win) => (
          <img
            key={win.name}
            src={avatarThumb(win.avatarSrc)}
            alt=""
            width={32}
            height={32}
            loading="lazy"
            decoding="async"
            className="h-8 w-8 rounded-full border-2 border-zinc-950 object-cover"
          />
        ))}
      </div>
      {(count || rating) && (
        <div className="flex flex-col items-start gap-0.5 text-left" data-testid="hero-proof-text">
          {rating && (
            <p className="flex items-center gap-2 text-sm text-zinc-200">
              {score !== null && <RatingStars score={score} />}
              <span>
                <span className="font-semibold text-white">{claims.ratingSummary.value}</span>
                {claims.ratingSummary.count && <span className="text-zinc-300"> from {claims.ratingSummary.count}</span>}
              </span>
            </p>
          )}
          {count && <p className="text-xs text-zinc-300">Used by {count} creators</p>}
        </div>
      )}
    </div>
  );
}
