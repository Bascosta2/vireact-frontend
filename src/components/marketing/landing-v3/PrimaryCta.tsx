import { Link } from 'react-router-dom';
import { Button } from '@/components/UI/button';
import { primaryCtaHref } from '@/funnel/cta';
import { track } from '@/lib/analytics';

export type CtaLocation =
  | 'sticky_bar'
  | 'hero'
  | 'free_stack'
  | 'phases'
  | 'credibility'
  | 'results'
  | 'library_teaser'
  | 'faq'
  | 'final';

interface PrimaryCtaProps {
  location: CtaLocation;
  className?: string;
}

export const PRIMARY_CTA_LABEL = 'Get my free hook analysis';

export function PrimaryCta({ location, className }: PrimaryCtaProps) {
  const href = primaryCtaHref();

  const handleClick = () => {
    track('cta_clicked', { location });
  };

  return (
    <Button
      asChild
      size="lg"
      className={className ?? 'min-h-[56px] px-6 text-base font-semibold shadow-lg shadow-pink-500/30'}
      onClick={handleClick}
    >
      <Link to={href}>
        <span>{PRIMARY_CTA_LABEL}</span>
        <span aria-hidden="true" className="ml-2 inline-flex h-5 w-5 items-center justify-center">
          →
        </span>
      </Link>
    </Button>
  );
}

