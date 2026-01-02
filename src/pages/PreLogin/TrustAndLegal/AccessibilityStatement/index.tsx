import React from 'react';
import TrustLegalPage from '../TrustLegalPage';

function AccessibilityStatement() {
    return (
        <TrustLegalPage title="Accessibility Statement">
            <p>
                Vireact is committed to ensuring digital accessibility for all users. We continually improve the user experience for everyone and apply the relevant accessibility standards.
            </p>
            
            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Our Commitment</h2>
            <p>
                We are committed to providing a website that is accessible to the widest possible audience, regardless of technology or ability. We actively work to increase the accessibility and usability of our website and in doing so adhere to many of the available standards and guidelines.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Accessibility Standards</h2>
            <p>
                This website endeavors to conform to level AA of the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines 2.1. These guidelines explain how to make web content more accessible for people with disabilities, and user-friendly for everyone.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Accessibility Features</h2>
            
            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Keyboard Navigation</h3>
            <p>
                Our website can be navigated using only a keyboard. All interactive elements are accessible via keyboard shortcuts and tab navigation.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Screen Reader Compatibility</h3>
            <p>
                We have implemented proper heading structure, alt text for images, and semantic HTML to ensure compatibility with screen readers and other assistive technologies.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Color Contrast</h3>
            <p>
                We maintain sufficient color contrast ratios between text and background colors to ensure readability for users with visual impairments.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mt-6 mb-3">Responsive Design</h3>
            <p>
                Our website is designed to be responsive and work across different devices and screen sizes, making it accessible on desktop, tablet, and mobile devices.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Ongoing Efforts</h2>
            <p>
                We regularly review our website to identify and fix accessibility issues. Our development team is trained in accessibility best practices and we conduct regular accessibility audits to ensure compliance.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Known Limitations</h2>
            <p>
                While we strive to make our website fully accessible, there may be some limitations. We are continuously working to improve accessibility and welcome feedback from users about any accessibility barriers they encounter.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Feedback and Support</h2>
            <p>
                If you encounter any accessibility barriers on our website or have suggestions for improvement, please contact us. We are committed to addressing accessibility issues promptly and making our platform more inclusive for all users.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Alternative Formats</h2>
            <p>
                If you need information from our website in an alternative format, such as large print, audio, or braille, please contact us and we will work with you to provide the information in a format that meets your needs.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
            <p>
                For accessibility-related questions or to report accessibility issues, please contact us through our support channels. We aim to respond to all accessibility inquiries within 48 hours.
            </p>
        </TrustLegalPage>
    );
}

export default AccessibilityStatement;
