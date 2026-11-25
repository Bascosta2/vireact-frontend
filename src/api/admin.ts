import Axios from './index';

/** Read-only admin dashboard API (/api/v1/admin-app). Needs a signed-in account with role admin. */

export interface AdminOverview {
    users: number;
    usersWeek: number;
    plans: Record<string, number>;
    analysesToday: number;
    analyses7d: number;
    failed7d: number;
    processing: number;
    errors24h: number;
    health: { database: string; uptimeMinutes: number; analysisJobs: number; status: 'healthy' | 'attention' };
}

export interface AdminUserRow {
    id: string;
    name: string | null;
    email: string;
    plan: string;
    promo: string | null;
    createdAt: string;
    videos: number;
}

export interface AdminUsersPage {
    rows: AdminUserRow[];
    total: number;
    page: number;
    pageSize: number;
}

export interface AdminPromoCode {
    code: string;
    plan: string;
    label: string;
    days: number | null;
    disabled: boolean;
    redemptions: number;
}

export interface AdminSkills {
    skills: { id: string; name: string; version: number }[];
    animationStyles: { id: string; name: string; bestFor: string; accent: string }[];
    betaAllowLists: { editor: number; accounts: number };
}

export interface AdminModelHealth {
    latestRun: { kind?: string; startedAt: string; finishedAt?: string | null; ok?: boolean; recordsUsed?: number } | null;
    model: { version: number; status: string; trainedAt: string; n: number } | null;
    learningEnabled: boolean;
    research: { enabled: boolean; recentRuns: { status: string; startedAt: string; finishedAt?: string | null }[] };
}

const get = async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
    const response = await Axios.get<{ data: T }>(`/admin-app${path}`, { params });
    return response.data.data;
};

export const getAdminOverview = () => get<AdminOverview>('/overview');
export const getAdminUsers = (q: string, page: number) => get<AdminUsersPage>('/users', { q: q || undefined, page });
export const getAdminPromoCodes = () => get<AdminPromoCode[]>('/promo-codes');
export const getAdminSkills = () => get<AdminSkills>('/skills');
export const getAdminModelHealth = () => get<AdminModelHealth>('/model-health');

/** Plans as "Pro 4, Premium 2" rows, biggest first; paid plans are everything except free. */
export function planRows(plans: Record<string, number>): { plan: string; count: number }[] {
    return Object.entries(plans)
        .map(([plan, count]) => ({ plan, count }))
        .sort((a, b) => b.count - a.count || a.plan.localeCompare(b.plan));
}

export function activeSubscriptions(plans: Record<string, number>): number {
    return Object.entries(plans).reduce((sum, [plan, n]) => (plan === 'free' ? sum : sum + n), 0);
}

/** Short label for a promo grant length. */
export function promoLength(days: number | null): string {
    return days === null ? 'Never expires' : `${days} days`;
}

/** Human "3d ago" style label for a timestamp; "never" when missing. */
export function ageLabel(iso: string | null | undefined, now: number = Date.now()): string {
    if (!iso) return 'never';
    const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
    if (mins < 60) return `${mins}m ago`;
    if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
    return `${Math.round(mins / 1440)}d ago`;
}

/** Link to the owner console on the API origin (deep pages live there). */
export function ownerConsoleUrl(backendUrl: string | undefined, path = '/admin/videos'): string {
    return `${(backendUrl ?? '').replace(/\/+$/, '')}${path}`;
}
