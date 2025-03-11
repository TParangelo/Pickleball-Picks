import React, { useState } from 'react';
import '../css/About.css'; // Reusing the About page styling
import '../css/PrivacyPolicy.css';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

const PrivacyPolicy = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="about-container">
      <div className="about-content">
        <h1>Privacy Policy</h1>
        
        <section className="about-section">
          <h2>Information We Collect</h2>
          <p>
            When you use Pickleball-Picks, we collect certain information to provide and improve our services:
          </p>
          <ul>
            <li>Account information (email, username)</li>
            <li>Pick history and betting preferences</li>
            <li>Usage data and site interaction</li>
            <li>Anonymous device and browser information from Google Analytics</li>
          </ul>

          {/* Google Analytics Section */}
          <div className="about-dropdown">
            <div 
              className="about-dropdown-header"
              onClick={() => toggleSection('analytics')}
            >
              <h3>Google Analytics Details</h3>
              {openSection === 'analytics' ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </div>
            <div className={`about-dropdown-content ${openSection === 'analytics' ? 'open' : ''}`}>
              <p>
                We use Google Analytics 4 (GA4) to analyze website traffic and improve our services. 
                GA4 collects anonymized data such as IP addresses, browser type, pages visited, and 
                interactions. This helps us understand user behavior and enhance our website.
              </p>
              <p>
                Google Analytics uses cookies to store non-personally identifiable information. 
                You can opt out of Google Analytics tracking by adjusting your browser settings 
                or using the Google Analytics Opt-Out Add-on.
              </p>
              <p>
                For more details on how Google collects and processes data, please visit Google's{' '}
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>How We Use Your Information</h2>
          <p>
            We use the collected information to:
          </p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Track and display your pick history</li>
            <li>Improve user experience</li>
            <li>Send important updates about our service</li>
            <li>Prevent fraudulent activity</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Data Security</h2>
          <p>
          We implement security measures to safeguard your personal information against 
          unauthorized access, disclosure, modification, or loss. However, no method of data transmission 
          or storage is completely secure, and we cannot guarantee absolute protection of your information
          </p>
        </section>

        <section className="about-section">
          <h2>Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal data</li>
            <li>Request data correction or deletion</li>
            <li>Opt out of promotional communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about our Privacy Policy, please contact us at:<br />
            Email: <a className="email-link" href="mailto:support@pickleball-picks.com">support@pickleball-picks.com</a><br />
            We aim to respond to all inquiries within 48 hours.
          </p>
        </section>

        <section className="about-section">
          <h2>Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the "Last
            Modified" date.
          </p>
          <p className="last-modified">
            Last Modified: March 2025
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 