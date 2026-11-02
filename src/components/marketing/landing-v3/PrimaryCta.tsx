import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { primaryCtaHref } from '@/funnel/cta';
import { track } from '@/lib/analytics';

export type CtaLocation =
  | 'sticky_bar'
  | 'hero'
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

const baseClass =
  'inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-orange-700 px-6 text-base font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/** The one primary CTA. A real link (not a button wrapping a link) so it is a single focus stop. */
export function PrimaryCta({ location, className }: PrimaryCtaProps) {
  return (
    <Link
      to={primaryCtaHref()}
      className={className ? `${baseClass} ${className}` : baseClass}
      onClick={() => track('cta_clicked', { location })}
    >
      <span>{PRIMARY_CTA_LABEL}</span>
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}
