import React from 'react';
import TrustLegalPage from '../TrustLegalPage';

function CookiesPreferences() {
    return (
        <TrustLegalPage title="Cookies Preferences">
            <p>
                This page explains how Vireact uses cookies and similar technologies, and how you can manage your cookie preferences.
            </p>
            
            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">What Are Cookies?</h2>
            <p>
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our platform.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Essential Cookies</h3>
            <p>
                These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and remembering your login status. The website cannot function properly without these cookies.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Analytics Cookies</h3>
            <p>
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our platform and user experience.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Functional Cookies</h3>
            <p>
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings. They may be set by us or by third-party providers whose services we have added to our pages.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Marketing Cookies</h3>
            <p>
                These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for individual users and thereby more valuable for publishers and third-party advertisers.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Managing Your Cookie Preferences</h2>
            <p>
                You can control and manage cookies in several ways. Please note that removing or blocking cookies can impact your user experience and parts of our website may no longer be fully accessible.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Browser Settings</h3>
            <p>
                Most web browsers allow you to control cookies through their settings preferences. You can set your browser to refuse cookies or delete certain cookies. However, this may affect the functionality of our website.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Cookie Consent</h3>
            <p>
                When you first visit our website, you'll see a cookie consent banner. You can choose which types of cookies you want to accept. You can change your preferences at any time by visiting this page.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Third-Party Cookies</h2>
            <p>
                Some cookies on our website are set by third-party services. These may include analytics providers, advertising networks, and social media platforms. We do not control these cookies, and you should check the relevant third-party websites for more information about their cookies.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Updates to This Policy</h2>
            <p>
                We may update this Cookie Preferences page from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
                If you have any questions about our use of cookies or this Cookie Preferences page, please contact us through our support channels.
            </p>
        </TrustLegalPage>
    );
}

export default CookiesPreferences;
