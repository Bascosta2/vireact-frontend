import { Link } from 'react-router-dom';
import { SUPPORT_EMAIL } from '@/constants';
import TrustLegalPage from '../TrustLegalPage';

const linkClass = 'underline hover:no-underline';

function PrivacyPolicy() {
    return (
        <TrustLegalPage title="Privacy Policy">
            <p><strong>Last updated: November 24, 2026</strong></p>
            <p>
                This Privacy Policy describes how Vireact collects, uses, and protects your information when you use our platform.
            </p>
            
            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p>
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, and any content you upload.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
                We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
            <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information in certain limited circumstances.
            </p>
            <p>
                <strong>Service providers (processors).</strong> When you use the optional background-removal feature in the editor, we send a 720p copy of your video to fal.ai (Features &amp; Labels, Inc.) for processing, using a signed link that expires after 1 hour. We delete that input copy afterwards, and the result is stored in our own storage. What fal.ai does with the video is subject to fal.ai's terms. We do not send your video to fal.ai unless you use this feature.
            </p>

            <section aria-labelledby="connected-accounts-heading">
                <h2 id="connected-accounts-heading" className="text-xl sm:text-2xl font-semibold mt-8 mb-4">4. Connected Social Accounts</h2>
                <p>
                    You can optionally connect your own TikTok, Instagram, Facebook Page, or YouTube account on the Accounts page. You sign in on the platform's own page, so we never see your password for that platform. We use what the platform shares only to show you how your own posts are performing and to match those posts to the videos you analyzed in Vireact.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>TikTok:</strong> your basic profile (name, username, avatar), your follower count, and a list of your public videos with their view, like, comment, and share counts.</li>
                    <li><strong>Instagram (professional accounts):</strong> your profile (username, name, avatar, follower count), your media (captions, links, timestamps, thumbnails), like and comment counts, and insights such as Reels views.</li>
                    <li><strong>Facebook Pages:</strong> the Pages you choose to share, their names, pictures, and follower counts, and the engagement and insights numbers of those Pages' posts.</li>
                    <li><strong>YouTube:</strong> read-only access to your channel (name, handle, avatar, subscriber count), your video list with view, like, and comment counts, and YouTube Analytics numbers such as watch time. See section 5.</li>
                </ul>
                <p className="mt-4">
                    <strong>What we store.</strong> For each connected account we store its platform ID, handle, display name, avatar link, follower count, connection status, and the post numbers we read. We also store the access token (and refresh token, where the platform gives one) that lets us read your numbers.
                </p>
                <p>
                    <strong>How tokens are protected.</strong> Tokens are encrypted before they are saved, using AES-256-GCM with a secret key kept separate from the database. They are never sent back to your browser.
                </p>
                <p>
                    <strong>Retention.</strong> We keep this data while the account stays connected. When you disconnect an account, we ask the platform to revoke our access where the platform supports it, then delete that account's stored tokens and saved post numbers. Results already saved on your own Vireact videos stay until you delete those videos or your account.
                </p>
                <p>
                    <strong>How to disconnect.</strong> Open the Accounts page and choose Disconnect next to the account. You can also remove Vireact's access at any time in the platform's own settings. See section 7 for deleting your data.
                </p>
            </section>

            <section aria-labelledby="google-data-heading">
                <h2 id="google-data-heading" className="text-xl sm:text-2xl font-semibold mt-8 mb-4">5. Google User Data and YouTube</h2>
                <p>
                    Vireact uses YouTube API Services. By connecting a YouTube account, you agree to be bound by the <a className={linkClass} href="https://www.youtube.com/t/terms" rel="noopener noreferrer">YouTube Terms of Service</a>. Google's handling of your data is described in the <a className={linkClass} href="https://policies.google.com/privacy" rel="noopener noreferrer">Google Privacy Policy</a>.
                </p>
                <p>
                    <strong>What we request.</strong> We ask for two read-only permissions: view your YouTube account (<code>youtube.readonly</code>) and view your YouTube Analytics reports (<code>yt-analytics.readonly</code>). We read your channel details, your videos and their public counts, and your analytics numbers. We never change, upload, or delete anything on your channel with these permissions.
                </p>
                <p>
                    <strong>Limited Use.</strong> Vireact's use and transfer to any other app of information received from Google APIs will adhere to the <a className={linkClass} href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements. In plain terms, we use your YouTube data only to provide the user-facing features you see in Vireact, such as showing your video numbers. We do not transfer or sell it to third parties such as advertising platforms or data brokers, we do not use it for ads, and we do not allow people to read it except with your consent, for security or abuse investigation, to comply with law, or in aggregated form for internal operations.
                </p>
                <p>
                    <strong>Revoking access.</strong> You can disconnect YouTube in Vireact (Accounts page) or remove Vireact's access at any time in your <a className={linkClass} href="https://security.google.com/settings/security/permissions" rel="noopener noreferrer">Google security settings</a>. When you disconnect in Vireact, we also ask Google to revoke the token and delete the stored YouTube tokens and saved video numbers.
                </p>
            </section>

            <section aria-labelledby="posting-heading">
                <h2 id="posting-heading" className="text-xl sm:text-2xl font-semibold mt-8 mb-4">6. Posting on Your Behalf</h2>
                <p>
                    Where scheduled posting is available to you, Vireact can publish a video to your connected TikTok, Instagram, Facebook Page, or YouTube account. This needs an extra permission that you grant separately when you connect, and it is never part of the default read-only connection. We post only the video and caption you choose to schedule, only to the platforms you select, and only at the time you set. We never post anything else, and we never post to your account without a schedule you created. You can cancel a scheduled post before it starts publishing, and you can revoke the posting permission at any time by disconnecting the account.
                </p>
            </section>

            <section aria-labelledby="deletion-heading">
                <h2 id="deletion-heading" className="text-xl sm:text-2xl font-semibold mt-8 mb-4">7. Data Deletion</h2>
                <p>
                    You can ask us to delete your data at any time.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>In the app:</strong> disconnect an account on the Accounts page. This takes effect right away and removes that account's stored tokens and saved post numbers. Disconnecting always removes the account's synced posts and sign-in tokens. You can also tick "Also delete the numbers this account added to my videos" to remove the numbers that account copied onto your uploaded videos. Your uploads, analyses, and anything you typed yourself are kept.</li>
                    <li><strong>By email:</strong> write to <a className={linkClass} href={`mailto:${SUPPORT_EMAIL}?subject=Data%20deletion%20request`}>{SUPPORT_EMAIL}</a> from the address on your Vireact account and tell us what to delete: your connected accounts only, or your whole Vireact account.</li>
                </ul>
                <p className="mt-4">
                    <strong>What gets deleted:</strong> connected account details, encrypted tokens, saved post numbers, and, if you ask for your whole account to be deleted by email, your profile and the content you uploaded (handled by us on request). <strong>Timeline:</strong> in-app disconnects are immediate; we complete email requests as soon as reasonably possible. We may keep limited records, such as payment records, where the law requires. For step-by-step instructions and to check the status of a request, visit <Link className={linkClass} to="/data-deletion">our data deletion page</Link>.
                </p>
            </section>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">8. Data Security</h2>
            <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">9. Cookies and Tracking</h2>
            <p>
                We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">10. Your Rights</h2>
            <p>
                You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. Contact us to exercise these rights.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">11. Data Retention</h2>
            <p>
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">12. International Transfers</h2>
            <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">13. Changes to This Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">14. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at <a className={linkClass} href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </p>
        </TrustLegalPage>
    );
}

export default PrivacyPolicy;
