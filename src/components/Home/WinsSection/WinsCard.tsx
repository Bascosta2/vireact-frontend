interface WinsCardProps {
  variant?: 'marquee' | 'mobile';
  initials: string;
  name: string;
  platform: string;
  niche: string;
  stat: string;
  context: string;
  quote: string;
  avatarSrc?: string;
}

function WinsCard({
  variant = 'marquee',
  initials,
  name,
  platform,
  niche,
  stat,
  context,
  quote,
  avatarSrc,
}: WinsCardProps) {
  const isMobile = variant === 'mobile';
  return (
    <article
      className={
        isMobile
          ? 'w-full min-w-0 max-w-full rounded-xl p-5 flex flex-col gap-3 bg-white/[0.04] border border-white/[0.08] transition-all duration-300'
          : 'flex-shrink-0 w-[320px] min-w-[320px] mx-3 rounded-xl p-5 flex flex-col gap-3 bg-white/[0.04] border border-white/[0.08] hover:border-[rgba(255,60,172,0.3)] hover:shadow-[0_0_20px_rgba(255,60,172,0.15)] transition-all duration-300 cursor-pointer'
      }
      aria-label={`Testimonial from ${name}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold overflow-hidden bg-zinc-800"
          style={
            avatarSrc
              ? undefined
              : {
                  background: 'linear-gradient(135deg, #FF3CAC, #FF8C00)',
                  fontSize: '15px',
                }
          }
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt={`${name} avatar`} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold text-[15px] truncate">{name}</p>
          <span className="inline-block mt-0.5 text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-zinc-400">
            {platform}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-zinc-500">{niche}</p>
      <p
        className={`font-bold ${isMobile ? 'text-2xl' : 'text-lg'}`}
        style={{
          background: 'linear-gradient(90deg, #FF3CAC, #FF8C00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {stat}
      </p>
      {context ? <p className="text-[11px] text-zinc-400">{context}</p> : null}
      <p
        className={`text-[13px] text-zinc-300 italic leading-relaxed mt-1 ${isMobile ? 'line-clamp-3' : ''}`}
      >
        &ldquo;{quote}&rdquo;
      </p>
    </article>
  );
}

export default WinsCard;
