import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import { getAdminUsers } from '@/api/admin';
import { useAdminData, useDebounced } from './useAdminData';

function UsersTab() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounced(query);
  const { data, error, loading } = useAdminData(() => getAdminUsers(search, page), [search, page]);

  const onSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); setPage(1); }, []);
  const onPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const onNext = useCallback(() => setPage((p) => p + 1), []);

  const lastPage = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return (
    <section aria-label="Users" className="space-y-4">
      <label className="block text-sm">
        <span className="sr-only">Search users</span>
        <input type="search" value={query} onChange={onSearch} placeholder="Search name or email" className="w-full max-w-sm rounded-xl border border-line bg-transparent px-3 py-2" />
      </label>
      {error && <p role="alert">{error}</p>}
      {loading && !data && <p role="status">Loading...</p>}
      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-fg-muted"><tr><th className="py-2">User</th><th>Plan</th><th>Signed up</th><th>Videos</th></tr></thead>
              <tbody>
                {data.rows.map((u) => (
                  <tr key={u.id} className="border-t border-line">
                    <td className="py-2">{u.name ?? '-'} <span className="text-fg-muted">{u.email}</span></td>
                    <td className="capitalize">{u.plan}{u.promo ? ` (${u.promo})` : ''}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>{u.videos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button type="button" className="btn-outline" onClick={onPrev} disabled={page <= 1}>Previous</button>
            <span>Page {page} of {lastPage} ({data.total} users)</span>
            <button type="button" className="btn-outline" onClick={onNext} disabled={page >= lastPage}>Next</button>
          </div>
        </>
      )}
    </section>
  );
}

export default UsersTab;
