import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TrustLegalPage from '../TrustAndLegal/TrustLegalPage';
import { fetchDeletionStatus, type DeletionStatus } from '@/lib/data-deletion';

const headingClass = 'text-xl sm:text-2xl font-semibold mt-8 mb-4';
const linkClass = 'text-white underline hover:no-underline';

interface StatusMessageProps {
    status: DeletionStatus | null;
    completedLabel: string | null;
}

function StatusMessage({ status, completedLabel }: StatusMessageProps) {
    if (!status) return <p>Checking your request...</p>;
    if (status.kind === 'pending') return <p>Your request was received and is still being processed. Check back later with this same link.</p>;
    if (status.kind === 'completed') return <p>Your data was deleted{completedLabel ? ` on ${completedLabel}` : ''}.</p>;
    if (status.kind === 'not-found') return <p>We could not find a request with that confirmation code. Check that the link is complete, or email us at support@vireact.com.</p>;
    return <p>We could not check this request right now. Try again in a few minutes, or email us at support@vireact.com.</p>;
}

function DataDeletion() {
    const [params] = useSearchParams();
    const code = params.get('code')?.trim() ?? '';
    const [status, setStatus] = useState<DeletionStatus | null>(null);

    useEffect(() => {
        if (!code) return;
        const controller = new AbortController();
        setStatus(null);
        void fetchDeletionStatus(code, controller.signal).then((result) => {
            if (!controller.signal.aborted) setStatus(result);
        });
        return () => controller.abort();
    }, [code]);

    const completedLabel = status?.kind === 'completed' && status.completedAt
        ? new Date(status.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <TrustLegalPage title="Data Deletion">
            <p>
                You can delete the data Vireact holds about you at any time. This page explains how, and lets you check the status of a request.
                For what we collect and why, see our <Link className={linkClass} to="/privacy-policy">Privacy Policy</Link>.
            </p>

            {code && (
                <section aria-labelledby="deletion-status-heading">
                    <h2 id="deletion-status-heading" className={headingClass}>Status of your request</h2>
                    <p>Confirmation code: <code>{code}</code></p>
                    <div role="status" aria-live="polite">
                        <StatusMessage status={status} completedLabel={completedLabel} />
                    </div>
                </section>
            )}

            <section aria-labelledby="deletion-app-heading">
                <h2 id="deletion-app-heading" className={headingClass}>Option 1: In the app</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Sign in to Vireact and open the Accounts page.</li>
                    <li>Choose Disconnect next to the account you want to remove (TikTok, Instagram, Facebook or YouTube). Where the option is offered, tick "delete my data" to also remove your Vireact data.</li>
                    <li>We ask the platform to revoke our access, then delete the stored access tokens and the post numbers we saved for that account.</li>
                </ol>
            </section>

            <section aria-labelledby="deletion-email-heading">
                <h2 id="deletion-email-heading" className={headingClass}>Option 2: By email</h2>
                <p>
                    Email <a className={linkClass} href="mailto:support@vireact.com?subject=Data%20deletion%20request">support@vireact.com</a> from
                    the address on your Vireact account with the subject "Data deletion request". Tell us whether you want only your connected social
                    accounts removed or your whole Vireact account and its data deleted. We may ask you to confirm it is you before we start.
                </p>
            </section>

            <section aria-labelledby="deletion-what-heading">
                <h2 id="deletion-what-heading" className={headingClass}>What gets deleted and when</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Disconnecting an account in the app takes effect right away: its stored tokens and its saved post numbers are deleted.</li>
                    <li>Requests sent by email or through Facebook, Instagram or Meta are completed within 30 days. Some records, such as payment records, may be kept longer where the law requires it.</li>
                    <li>You can also remove Vireact's access from the platform's side at any time, in your TikTok, Instagram, Facebook or <a className={linkClass} href="https://security.google.com/settings/security/permissions" rel="noopener noreferrer">Google</a> settings.</li>
                </ul>
            </section>
        </TrustLegalPage>
    );
}

export default DataDeletion;
