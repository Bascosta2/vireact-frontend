import { getAdminPromoCodes, promoLength } from '@/api/admin';
import { CARD, useAdminData } from './useAdminData';

function PromoTab() {
  const { data, error, loading } = useAdminData(getAdminPromoCodes);
  if (loading) return <p role="status">Loading...</p>;
  if (error || !data) return <p role="alert">{error}</p>;
  return (
    <section aria-label="Promo codes" className="grid gap-3 md:grid-cols-2">
      {data.map((p) => (
        <article key={p.code} className={CARD}>
          <h3 className="font-semibold">{p.code}{p.disabled ? ' (switched off)' : ''}</h3>
          <p className="text-sm text-fg-muted">{p.label} - {promoLength(p.days)}</p>
          <p className="mt-2 text-sm">Redeemed {p.redemptions} times</p>
        </article>
      ))}
    </section>
  );
}

export default PromoTab;
